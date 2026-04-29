using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using aabu_project.Dtos;
using Microsoft.Extensions.Caching.Memory;

namespace aabu_project.Services
{
    // ── Internal session state ────────────────────────────────────────────────

    internal sealed class InterviewSession
    {
        public string SessionId          { get; set; } = string.Empty;
        public string JobTitle           { get; set; } = string.Empty;
        public string JobDescription     { get; set; } = string.Empty;
        public int    CurrentQuestion    { get; set; }   // 1-based, current question shown
        public int    TotalQuestions     { get; set; } = 5;
        public string LastQuestion       { get; set; } = string.Empty;
        public List<QuestionSummaryDto> History { get; set; } = new();
    }

    // ── Gemini response shapes (internal only) ────────────────────────────────

    internal sealed class GeminiQuestionDto
    {
        public string Question { get; set; } = string.Empty;
    }

    internal sealed class GeminiEvaluationDto
    {
        public string Feedback     { get; set; } = string.Empty;
        public double Score        { get; set; }
        public string NextQuestion { get; set; } = string.Empty;
    }

    internal sealed class GeminiFinalDto
    {
        public double        OverallScore { get; set; }
        public string        Summary      { get; set; } = string.Empty;
        public List<string>  Strengths    { get; set; } = new();
        public List<string>  Improvements { get; set; } = new();
    }

    // ── Service ───────────────────────────────────────────────────────────────

    public sealed class InterviewService : IInterviewService
    {
        private readonly HttpClient   _http;
        private readonly IMemoryCache _cache;
        private readonly string       _apiKey;
        private readonly string       _geminiUrl;
        private readonly ILogger<InterviewService> _logger;

        private const int MaxJobChars = 600; // keep prompts tight

        private static readonly JsonSerializerOptions JsonOpts =
            new() { PropertyNameCaseInsensitive = true };

        public InterviewService(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<InterviewService> logger,
            IMemoryCache cache)
        {
            _http    = httpClient;
            _logger  = logger;
            _cache   = cache;
            _apiKey  = configuration["GeminiSettings:ApiKey"] ?? string.Empty;

            var model   = configuration["GeminiSettings:ModelName"] ?? "gemini-1.5-flash";
            var baseUrl = configuration["GeminiSettings:BaseUrl"]   ?? "https://generativelanguage.googleapis.com/v1beta/models";
            _geminiUrl  = $"{baseUrl}/{model}:generateContent";
        }

        // ── Start ─────────────────────────────────────────────────────────────

        public async Task<InterviewResponseDto> StartAsync(string jobTitle, string jobDescription)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
                throw new InvalidOperationException(
                    "Gemini API key not configured. Set GeminiSettings:ApiKey.");

            var jobDesc = Truncate(jobDescription, MaxJobChars);

            var prompt = $$"""
                You are a professional technical interviewer conducting a job interview.

                Position: {{jobTitle}}
                Requirements: {{jobDesc}}

                Ask question 1 of 5. Make it an open-ended question relevant to this role —
                covering technical knowledge, experience, or problem-solving.

                Return ONLY valid JSON (no markdown, no code fences):
                { "question": "..." }
                """;

            var raw      = await CallGeminiAsync(prompt);
            var parsed   = ParseJson<GeminiQuestionDto>(raw) ?? new GeminiQuestionDto { Question = "Tell me about your experience relevant to this role." };

            var sessionId = Guid.NewGuid().ToString("N")[..12];
            var session   = new InterviewSession
            {
                SessionId        = sessionId,
                JobTitle         = jobTitle.Trim(),
                JobDescription   = jobDescription.Trim(),
                CurrentQuestion  = 1,
                LastQuestion     = parsed.Question
            };

            _cache.Set(CacheKey(sessionId), session, TimeSpan.FromMinutes(30));

            _logger.LogInformation("Interview started. Session={Session}, Job={Job}", sessionId, jobTitle);

            return new InterviewResponseDto
            {
                SessionId      = sessionId,
                QuestionNumber = 1,
                TotalQuestions = session.TotalQuestions,
                IsComplete     = false,
                Question       = parsed.Question
            };
        }

        // ── Answer ────────────────────────────────────────────────────────────

        public async Task<InterviewResponseDto> AnswerAsync(string sessionId, string answer)
        {
            if (!_cache.TryGetValue(CacheKey(sessionId), out InterviewSession? session) || session is null)
                throw new KeyNotFoundException(
                    "Interview session not found or expired. Please start a new interview.");

            var questionAsked = session.LastQuestion;
            var qNum          = session.CurrentQuestion;
            var isLastQuestion = qNum >= session.TotalQuestions;

            // ── Evaluate the answer ──────────────────────────────────────────
            string feedbackText;
            double score;
            string nextQuestion = string.Empty;

            if (!isLastQuestion)
            {
                var evalPrompt = $$"""
                    You are interviewing a candidate for the role of {{session.JobTitle}}.

                    Question {{qNum}} of {{session.TotalQuestions}}: "{{questionAsked}}"
                    Candidate answered: "{{Truncate(answer, 800)}}"

                    Evaluate the answer (1-2 sentences) and generate question {{qNum + 1}}.

                    Return ONLY valid JSON (no markdown):
                    { "feedback": "...", "score": 7, "nextQuestion": "..." }

                    Score: 0-3=poor, 4-6=adequate, 7-8=good, 9-10=excellent
                    """;

                var evalRaw  = await CallGeminiAsync(evalPrompt);
                var eval     = ParseJson<GeminiEvaluationDto>(evalRaw)
                    ?? new GeminiEvaluationDto { Feedback = "Answer received.", Score = 5, NextQuestion = "Tell me about a challenge you overcame." };

                feedbackText = eval.Feedback;
                score        = Math.Clamp(eval.Score, 0, 10);
                nextQuestion = string.IsNullOrWhiteSpace(eval.NextQuestion)
                    ? "Can you describe a relevant project or achievement?"
                    : eval.NextQuestion;
            }
            else
            {
                // Last question: only evaluate, no next question
                var evalPrompt = $$"""
                    Final evaluation for {{session.JobTitle}} candidate.
                    Question: "{{questionAsked}}"
                    Answer: "{{Truncate(answer, 800)}}"

                    Return ONLY valid JSON:
                    { "feedback": "...", "score": 7 }
                    """;

                var evalRaw  = await CallGeminiAsync(evalPrompt);
                var eval     = ParseJson<GeminiEvaluationDto>(evalRaw)
                    ?? new GeminiEvaluationDto { Feedback = "Thank you for your answer.", Score = 6 };

                feedbackText = eval.Feedback;
                score        = Math.Clamp(eval.Score, 0, 10);
            }

            // Persist this Q&A in session history
            session.History.Add(new QuestionSummaryDto
            {
                Question = questionAsked,
                Answer   = answer.Trim(),
                Feedback = feedbackText,
                Score    = score
            });

            // ── Final report ─────────────────────────────────────────────────
            if (isLastQuestion)
            {
                _logger.LogInformation("Interview complete. Session={Session}", sessionId);
                var report = await GenerateFinalReportAsync(session);

                // Clean up session from cache
                _cache.Remove(CacheKey(sessionId));

                return new InterviewResponseDto
                {
                    SessionId      = sessionId,
                    QuestionNumber = qNum,
                    TotalQuestions = session.TotalQuestions,
                    IsComplete     = true,
                    Feedback       = feedbackText,
                    AnswerScore    = score,
                    FinalScore     = report.OverallScore,
                    FinalSummary   = report.Summary,
                    Strengths      = report.Strengths,
                    Improvements   = report.Improvements,
                    History        = session.History
                };
            }

            // ── Continue interview ────────────────────────────────────────────
            session.CurrentQuestion++;
            session.LastQuestion = nextQuestion;
            _cache.Set(CacheKey(sessionId), session, TimeSpan.FromMinutes(30));

            return new InterviewResponseDto
            {
                SessionId      = sessionId,
                QuestionNumber = session.CurrentQuestion,
                TotalQuestions = session.TotalQuestions,
                IsComplete     = false,
                Question       = nextQuestion,
                Feedback       = feedbackText,
                AnswerScore    = score
            };
        }

        // ── Final Report ──────────────────────────────────────────────────────

        private async Task<GeminiFinalDto> GenerateFinalReportAsync(InterviewSession session)
        {
            var avgScore = session.History.Count > 0
                ? session.History.Average(h => h.Score)
                : 5;

            var historyText = string.Join("\n", session.History.Select((h, i) =>
                $"Q{i + 1}: {h.Question}\nA: {Truncate(h.Answer, 200)}\nScore: {h.Score}/10"));

            var prompt = $$"""
                You are an interviewer who just finished a technical interview for {{session.JobTitle}}.

                Interview summary:
                {{historyText}}

                Average score: {{avgScore:F1}}/10

                Provide a professional final assessment.
                Return ONLY valid JSON (no markdown):
                {
                  "overallScore": 72,
                  "summary": "...",
                  "strengths": ["...", "..."],
                  "improvements": ["...", "..."]
                }

                overallScore: integer 0-100. Derive it from the average score ({{avgScore:F1}}/10 → scale to 0-100).
                summary: 2-3 sentences overall assessment.
                strengths/improvements: 2-3 items each, specific and actionable.
                """;

            var raw    = await CallGeminiAsync(prompt);
            var result = ParseJson<GeminiFinalDto>(raw);

            return result ?? new GeminiFinalDto
            {
                OverallScore = Math.Round(avgScore * 10),
                Summary      = "The candidate demonstrated relevant knowledge for this role.",
                Strengths    = ["Engaged with all questions", "Provided relevant answers"],
                Improvements = ["Could elaborate more on technical details", "Consider adding concrete examples"]
            };
        }

        // ── Gemini HTTP ───────────────────────────────────────────────────────

        private async Task<string> CallGeminiAsync(string prompt)
        {
            var body = new
            {
                contents = new[] { new { parts = new[] { new { text = prompt } } } },
                generationConfig = new { temperature = 0.4, maxOutputTokens = 1200, thinkingConfig = new { thinkingBudget = 0 } }
            };

            var content  = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));

            HttpResponseMessage response;
            try
            {
                response = await _http.PostAsync($"{_geminiUrl}?key={_apiKey}", content, cts.Token);
            }
            catch (TaskCanceledException)
            {
                throw new TimeoutException("Gemini API timed out.");
            }

            var raw = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                var code = (int)response.StatusCode;
                _logger.LogError("Gemini {Code}: {Body}", code, raw);
                throw code switch
                {
                    429 => new InvalidOperationException("QUOTA_EXCEEDED"),
                    401 or 403 => new UnauthorizedAccessException("Invalid Gemini API key."),
                    _ => new InvalidOperationException($"Gemini returned {code}: {raw}")
                };
            }

            return ExtractText(raw);
        }

        private static string ExtractText(string body)
        {
            using var doc  = JsonDocument.Parse(body);
            var candidates = doc.RootElement.GetProperty("candidates");
            if (candidates.GetArrayLength() == 0)
                throw new InvalidOperationException("Gemini returned no candidates.");

            return candidates[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString()
                ?? throw new InvalidOperationException("Gemini returned empty text.");
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private static T? ParseJson<T>(string text) where T : class
        {
            text = text.Trim();

            // Strip markdown fences
            var fence = Regex.Match(text, @"```(?:json)?\s*([\s\S]*?)```", RegexOptions.IgnoreCase);
            if (fence.Success) text = fence.Groups[1].Value.Trim();
            else
            {
                var s = text.IndexOf('{');
                var e = text.LastIndexOf('}');
                if (s >= 0 && e > s) text = text[s..(e + 1)];
            }

            // Normalise common snake_case keys
            text = text
                .Replace("\"next_question\"",  "\"nextQuestion\"")
                .Replace("\"overall_score\"",  "\"overallScore\"");

            try { return JsonSerializer.Deserialize<T>(text, JsonOpts); }
            catch { return null; }
        }

        private static string Truncate(string text, int max)
        {
            if (text.Length <= max) return text;
            var cut = text[..max];
            var sp  = cut.LastIndexOf(' ');
            return sp > 0 ? cut[..sp] + "…" : cut;
        }

        private static string CacheKey(string sessionId) => $"interview:{sessionId}";
    }
}
