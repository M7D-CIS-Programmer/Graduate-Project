using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using aabu_project.Dtos;
using Microsoft.Extensions.Caching.Memory;
using UglyToad.PdfPig;

namespace aabu_project.Services
{
    // Internal DTO — only used to deserialise the small Gemini advisor response
    internal sealed class GeminiInsightsDto
    {
        public List<string> WeakSections           { get; set; } = new();
        public List<string> ImprovementSuggestions { get; set; } = new();
    }

    public sealed class CVAnalysisService : ICVAnalysisService
    {
        private readonly HttpClient        _httpClient;
        private readonly IMemoryCache      _cache;
        private readonly CvLocalAnalyzer   _localAnalyzer;
        private readonly ILogger<CVAnalysisService> _logger;
        private readonly string _apiKey;
        private readonly string _geminiUrl;

        // Trimmed job description limit — only needed for context, not full analysis
        private const int MaxJobDescChars = 1_200;

        private static readonly JsonSerializerOptions JsonOpts =
            new() { PropertyNameCaseInsensitive = true };

        public CVAnalysisService(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<CVAnalysisService> logger,
            IMemoryCache cache,
            CvLocalAnalyzer localAnalyzer)
        {
            _httpClient    = httpClient;
            _logger        = logger;
            _cache         = cache;
            _localAnalyzer = localAnalyzer;
            _apiKey        = configuration["GeminiSettings:ApiKey"] ?? string.Empty;

            var model   = configuration["GeminiSettings:ModelName"] ?? "gemini-1.5-flash";
            var baseUrl = configuration["GeminiSettings:BaseUrl"]   ?? "https://generativelanguage.googleapis.com/v1beta/models";
            _geminiUrl  = $"{baseUrl}/{model}:generateContent";
        }

        // ── PDF Extraction ────────────────────────────────────────────────────────

        public string ExtractTextFromPdf(Stream pdfStream)
        {
            var sb = new StringBuilder();
            using var document = PdfDocument.Open(pdfStream);

            if (document.NumberOfPages == 0)
                throw new InvalidOperationException("The PDF contains no pages.");

            foreach (var page in document.GetPages())
            {
                var words = page.GetWords().Select(w => w.Text).ToList();
                if (words.Count > 0)
                    sb.AppendLine(string.Join(" ", words));
            }

            var raw = sb.ToString();
            if (string.IsNullOrWhiteSpace(raw))
                throw new InvalidOperationException(
                    "No text could be extracted. The PDF may be a scanned image with no selectable text.");

            return CleanText(raw);
        }

        private static string CleanText(string text)
        {
            text = Regex.Replace(text, @"[ \t]{2,}", " ");
            text = Regex.Replace(text, @"\r\n|\r",   "\n");
            text = Regex.Replace(text, @"\n{3,}",    "\n\n");
            return text.Trim();
        }

        // ── Main Analysis — Hybrid Pipeline ───────────────────────────────────────

        public async Task<CVAnalysisResponseDto> AnalyzeCvAsync(
            string cvText, string jobTitle, string jobDescription)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
                throw new InvalidOperationException(
                    "Gemini API key is not configured. Set GeminiSettings:ApiKey in appsettings.json.");

            // ── 1. Cache check (SHA-256 of all inputs) ────────────────────────────
            var cacheKey = ComputeCacheKey(cvText, jobTitle, jobDescription);

            if (_cache.TryGetValue(cacheKey, out CVAnalysisResponseDto? cached) && cached is not null)
            {
                _logger.LogInformation(
                    "[CACHE HIT] key={Key} — Gemini call skipped.", cacheKey);
                return cached;
            }

            // ── 2. Local analysis (zero AI tokens) ───────────────────────────────
            var local = _localAnalyzer.Analyze(cvText, jobTitle, jobDescription);

            // ── 3. Gemini — insights ONLY, minimal prompt ─────────────────────────
            //    We send skill lists (~150 chars), NOT the full CV (~8 000 chars)
            var prompt  = BuildInsightPrompt(jobTitle, local.MatchedSkills, local.MissingSkills);
            var rawText = await CallGeminiAsync(prompt);
            var insights = ParseInsights(rawText);

            // ── 4. Merge: local numbers + AI advisor narrative ────────────────────
            var result = new CVAnalysisResponseDto
            {
                MatchScore             = local.MatchPercentage,   // job-specific match %
                MissingSkills          = local.MissingSkills,
                KeywordGaps            = local.KeywordMissing,
                WeakSections           = insights.WeakSections,
                ImprovementSuggestions = insights.ImprovementSuggestions
            };

            // ── 5. Cache for 1 hour ───────────────────────────────────────────────
            _cache.Set(cacheKey, result, TimeSpan.FromHours(1));
            _logger.LogInformation(
                "[CACHE MISS] Analysis complete. Result cached under key={Key}.", cacheKey);

            return result;
        }

        // ── Cache Key ─────────────────────────────────────────────────────────────

        private static string ComputeCacheKey(
            string cvText, string jobTitle, string jobDescription)
        {
            var combined = string.Concat(
                cvText.Trim().ToLowerInvariant(), "|",
                jobTitle.Trim().ToLowerInvariant(), "|",
                jobDescription.Trim().ToLowerInvariant());

            var hash = SHA256.HashData(Encoding.UTF8.GetBytes(combined));
            return "cv:" + Convert.ToHexString(hash)[..24];
        }

        // ── Strict Advisor Prompt (zero CV rewriting — suggestions only) ─────────

        private static string BuildInsightPrompt(
            string jobTitle,
            List<string> matchedSkills,
            List<string> missingSkills)
        {
            var matched = matchedSkills.Count > 0
                ? string.Join(", ", matchedSkills)
                : "none identified";

            var missing = missingSkills.Count > 0
                ? string.Join(", ", missingSkills)
                : "none identified";

            return $$"""
                You are a strict CV advisor. Your ONLY job is to provide improvement feedback.

                ⚠️ CRITICAL RULES — NEVER break these:
                - Do NOT rewrite the CV
                - Do NOT generate new CV content or paragraphs
                - Do NOT rephrase the user's existing text
                - ONLY identify what is weak and suggest what to add or fix

                Context:
                Job Title: {{jobTitle}}
                Candidate's Matched Skills: {{matched}}
                Candidate's Missing Skills: {{missing}}

                Return ONLY valid JSON (no markdown, no code fences):
                {
                  "weak_sections": [
                    "Specific section name + why it is weak (e.g., Experience section lacks measurable achievements)",
                    "..."
                  ],
                  "improvement_suggestions": [
                    "Specific actionable step (e.g., Add Docker and Kubernetes to skills section)",
                    "..."
                  ]
                }

                Advisor rules:
                - weak_sections: name the CV section and explain the weakness. 2-4 items.
                - improvement_suggestions: tell WHAT to add/fix, not HOW to write it. 2-4 items.
                - Use short action phrases like "Add...", "Include...", "Quantify...", "Remove..."
                - Be specific to the job title and skill gaps above.
                """;
        }

        // ── Gemini HTTP Call ──────────────────────────────────────────────────────

        private async Task<string> CallGeminiAsync(string prompt)
        {
            var body = new
            {
                contents = new[] { new { parts = new[] { new { text = prompt } } } },
                // Small output — we only need 3 short arrays
                generationConfig = new { temperature = 0.2, maxOutputTokens = 800, thinkingConfig = new { thinkingBudget = 0 } }
            };

            var content = new StringContent(
                JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
            HttpResponseMessage response;

            try
            {
                response = await _httpClient.PostAsync(
                    $"{_geminiUrl}?key={_apiKey}", content, cts.Token);
            }
            catch (TaskCanceledException)
            {
                throw new TimeoutException("Gemini API request timed out after 30 seconds.");
            }

            var body2 = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                var code = (int)response.StatusCode;
                _logger.LogError("Gemini {StatusCode}: {Body}", code, body2);

                throw code switch
                {
                    429 => new InvalidOperationException("QUOTA_EXCEEDED"),
                    400 => new InvalidOperationException($"Gemini bad request: {body2}"),
                    401 or 403 => new UnauthorizedAccessException("Invalid or missing Gemini API key."),
                    _ => new InvalidOperationException($"Gemini returned {code}: {body2}")
                };
            }

            return ExtractGeminiText(body2);
        }

        // ── Gemini Response Parsing ───────────────────────────────────────────────

        private static string ExtractGeminiText(string body)
        {
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            if (!root.TryGetProperty("candidates", out var candidates)
                || candidates.GetArrayLength() == 0)
                throw new InvalidOperationException("Gemini returned no candidates.");

            var text = candidates[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return text ?? throw new InvalidOperationException("Gemini returned empty text.");
        }

        private static GeminiInsightsDto ParseInsights(string text)
        {
            var json = ExtractJson(text);
            try
            {
                return JsonSerializer.Deserialize<GeminiInsightsDto>(json, JsonOpts)
                    ?? FallbackInsights();
            }
            catch (JsonException)
            {
                // Parsing failure should never block the user — return a safe fallback
                return FallbackInsights();
            }
        }

        private static GeminiInsightsDto FallbackInsights() => new()
        {
            WeakSections = [
                "Skills section may be missing key technologies required for this role",
                "Experience section could benefit from measurable achievements"
            ],
            ImprovementSuggestions = [
                "Add the missing skills listed above to your Skills section",
                "Include quantified results in your experience (e.g., 'Increased performance by 30%')",
                "Align your summary/objective with the job title and required skills"
            ]
        };

        private static string ExtractJson(string text)
        {
            text = text.Trim();

            var fence = Regex.Match(text, @"```(?:json)?\s*([\s\S]*?)```", RegexOptions.IgnoreCase);
            if (fence.Success)
                text = fence.Groups[1].Value.Trim();
            else
            {
                var start = text.IndexOf('{');
                var end   = text.LastIndexOf('}');
                if (start >= 0 && end > start)
                    text = text[start..(end + 1)];
            }

            // Normalise snake_case keys Gemini may return
            text = text
                .Replace("\"weak_sections\"",           "\"weakSections\"")
                .Replace("\"improvement_suggestions\"",  "\"improvementSuggestions\"");

            return text;
        }
    }
}
