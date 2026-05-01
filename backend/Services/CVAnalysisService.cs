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

    // Internal DTO — deserialises the unified match Gemini response
    internal sealed class GeminiMatchResultDto
    {
        public int           MatchScore             { get; set; }
        public List<string>  MatchedSkills          { get; set; } = new();
        public List<string>  MissingSkills          { get; set; } = new();
        public string        Summary                { get; set; } = string.Empty;
        public List<string>  WeakSections           { get; set; } = new();
        public List<string>  ImprovementSuggestions { get; set; } = new();
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

        // ── Local-only text analysis (no Gemini) ─────────────────────────────────

        public LocalAnalysisResult LocalAnalyzeText(
            string cvText, string jobTitle, string jobDescription)
        {
            if (string.IsNullOrWhiteSpace(cvText))
                return new LocalAnalysisResult();

            return _localAnalyzer.Analyze(cvText, jobTitle, jobDescription);
        }

        // ── Semantic Analysis ─────────────────────────────────────────────────────

        // CV text is capped to keep Gemini costs predictable
        private const int MaxCvCharsForSemantic  = 6_000;
        private const int MaxJobCharsForSemantic  = 2_000;

        public async Task<SemanticCVAnalysisResponseDto> SemanticAnalyzeCvAsync(
            string cvText, string jobDescription)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
                throw new InvalidOperationException(
                    "Gemini API key is not configured. Set GeminiSettings:ApiKey in appsettings.json.");

            var cacheKey = ComputeCacheKey(cvText, "semantic", jobDescription);

            if (_cache.TryGetValue(cacheKey, out SemanticCVAnalysisResponseDto? cached) && cached is not null)
            {
                _logger.LogInformation("[CACHE HIT] semantic key={Key}", cacheKey);
                return cached;
            }

            var truncatedCv  = cvText.Length  > MaxCvCharsForSemantic  ? cvText[..MaxCvCharsForSemantic]  : cvText;
            var truncatedJob = jobDescription.Length > MaxJobCharsForSemantic ? jobDescription[..MaxJobCharsForSemantic] : jobDescription;

            var prompt   = BuildSemanticPrompt(truncatedCv, truncatedJob);
            var rawText  = await CallGeminiSemanticAsync(prompt);
            var result   = ParseSemanticInsights(rawText);

            _cache.Set(cacheKey, result, TimeSpan.FromHours(1));
            _logger.LogInformation("[CACHE MISS] Semantic analysis complete. key={Key}", cacheKey);

            return result;
        }

        private static string BuildSemanticPrompt(string cvText, string jobDescription) => $$"""
            You are an expert AI CV Analyst inside a recruitment system.

            Your task:
            Analyze the candidate CV against the Job Description and extract ONLY deep semantic insights.

            You are NOT allowed to:
            - Perform simple keyword counting
            - Do mathematical scoring based on skills (this is handled by system code)
            - Guess missing information

            Focus ONLY on:
            - Semantic relevance (meaning, not keywords)
            - Quality of experience descriptions
            - Logical consistency of CV
            - Red flags or suspicious content
            - True suitability reasoning

            Job Description:
            {{jobDescription}}

            Candidate CV:
            {{cvText}}

            Return ONLY valid JSON — no markdown fences, no extra text:
            {
              "semanticMatchAnalysis": "Explain how well the candidate fits the role in a meaningful way",
              "keyMatchingAreas": ["..."],
              "missingCriticalSkills": ["..."],
              "experienceQuality": "low | medium | high",
              "consistencyCheck": "pass | warning | fail",
              "fraudIndicators": ["..."],
              "overallInsight": "short professional conclusion"
            }

            RULES:
            - Be strict and realistic
            - Do not exaggerate candidate strengths
            - Do not assume missing data
            - Focus on logic and meaning, not keywords
            - fraudIndicators must be an empty array [] if nothing suspicious is found
            """;

        private async Task<string> CallGeminiSemanticAsync(string prompt)
        {
            var body = new
            {
                contents = new[] { new { parts = new[] { new { text = prompt } } } },
                generationConfig = new { temperature = 0.1, maxOutputTokens = 1_200, thinkingConfig = new { thinkingBudget = 0 } }
            };

            var content = new StringContent(
                JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(45));
            HttpResponseMessage response;

            try
            {
                response = await _httpClient.PostAsync(
                    $"{_geminiUrl}?key={_apiKey}", content, cts.Token);
            }
            catch (TaskCanceledException)
            {
                throw new TimeoutException("Gemini semantic analysis timed out after 45 seconds.");
            }

            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                var code = (int)response.StatusCode;
                _logger.LogError("Gemini semantic {StatusCode}: {Body}", code, responseBody);

                throw code switch
                {
                    429 => new InvalidOperationException("QUOTA_EXCEEDED"),
                    400 => new InvalidOperationException($"Gemini bad request: {responseBody}"),
                    401 or 403 => new UnauthorizedAccessException("Invalid or missing Gemini API key."),
                    _ => new InvalidOperationException($"Gemini returned {code}: {responseBody}")
                };
            }

            return ExtractGeminiText(responseBody);
        }

        private static SemanticCVAnalysisResponseDto ParseSemanticInsights(string text)
        {
            var json = ExtractSemanticJson(text);
            try
            {
                var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<SemanticCVAnalysisResponseDto>(json, opts)
                    ?? FallbackSemantic();
            }
            catch (JsonException)
            {
                return FallbackSemantic();
            }
        }

        private static SemanticCVAnalysisResponseDto FallbackSemantic() => new()
        {
            SemanticMatchAnalysis = "Analysis could not be completed. Please try again.",
            KeyMatchingAreas      = [],
            MissingCriticalSkills = [],
            ExperienceQuality     = "medium",
            ConsistencyCheck      = "pass",
            FraudIndicators       = [],
            OverallInsight        = "Unable to generate insight at this time."
        };

        private static string ExtractSemanticJson(string text)
        {
            text = text.Trim();

            var fence = Regex.Match(text, @"```(?:json)?\s*([\s\S]*?)```", RegexOptions.IgnoreCase);
            if (fence.Success)
                return fence.Groups[1].Value.Trim();

            var start = text.IndexOf('{');
            var end   = text.LastIndexOf('}');
            if (start >= 0 && end > start)
                return text[start..(end + 1)];

            return text;
        }

        // ── Fraud Detection ───────────────────────────────────────────────────────

        private const int MaxCvCharsForFraud = 6_000;

        public async Task<CVFraudDetectionResponseDto> DetectCvFraudAsync(string cvText)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
                throw new InvalidOperationException(
                    "Gemini API key is not configured. Set GeminiSettings:ApiKey in appsettings.json.");

            var cacheKey = ComputeCacheKey(cvText, "fraud", string.Empty);

            if (_cache.TryGetValue(cacheKey, out CVFraudDetectionResponseDto? cached) && cached is not null)
            {
                _logger.LogInformation("[CACHE HIT] fraud key={Key}", cacheKey);
                return cached;
            }

            var truncatedCv = cvText.Length > MaxCvCharsForFraud ? cvText[..MaxCvCharsForFraud] : cvText;

            var prompt  = BuildFraudPrompt(truncatedCv);
            var rawText = await CallGeminiFraudAsync(prompt);
            var result  = ParseFraudResponse(rawText);

            _cache.Set(cacheKey, result, TimeSpan.FromHours(1));
            _logger.LogInformation("[CACHE MISS] Fraud detection complete. key={Key}", cacheKey);

            return result;
        }

        private static string BuildFraudPrompt(string cvText) => $$"""
            You are a CV Integrity & Fraud Detection AI.

            Your task is to detect inconsistencies or unrealistic claims in the CV below.

            Check for:
            - Unrealistic years of experience relative to age signals
            - Impossible career progression (e.g. senior roles without junior history)
            - Overstated skills without any supporting evidence in job descriptions
            - Contradicting dates or overlapping roles
            - Fake-sounding or vague job history
            - Suspiciously generic descriptions with no specifics

            CV TEXT:
            {{cvText}}

            Return ONLY valid JSON — no markdown fences, no extra text:
            {
              "isSuspicious": true,
              "riskLevel": "low | medium | high",
              "issuesFound": [
                {
                  "issue": "description of the issue",
                  "reason": "why it is suspicious"
                }
              ],
              "finalVerdict": "trusted | questionable | likely_fake"
            }

            RULES:
            - Do not assume guilt without concrete evidence from the CV text
            - Be analytical and logical — base every issue on text you can quote
            - If nothing suspicious is found: isSuspicious=false, riskLevel="low", issuesFound=[], finalVerdict="trusted"
            - Focus on consistency of timeline and the plausibility of skill claims
            """;

        private async Task<string> CallGeminiFraudAsync(string prompt)
        {
            var body = new
            {
                contents = new[] { new { parts = new[] { new { text = prompt } } } },
                generationConfig = new { temperature = 0.1, maxOutputTokens = 1_000, thinkingConfig = new { thinkingBudget = 0 } }
            };

            var content = new StringContent(
                JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(45));
            HttpResponseMessage response;

            try
            {
                response = await _httpClient.PostAsync(
                    $"{_geminiUrl}?key={_apiKey}", content, cts.Token);
            }
            catch (TaskCanceledException)
            {
                throw new TimeoutException("Gemini fraud detection timed out after 45 seconds.");
            }

            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                var code = (int)response.StatusCode;
                _logger.LogError("Gemini fraud {StatusCode}: {Body}", code, responseBody);

                throw code switch
                {
                    429 => new InvalidOperationException("QUOTA_EXCEEDED"),
                    400 => new InvalidOperationException($"Gemini bad request: {responseBody}"),
                    401 or 403 => new UnauthorizedAccessException("Invalid or missing Gemini API key."),
                    _ => new InvalidOperationException($"Gemini returned {code}: {responseBody}")
                };
            }

            return ExtractGeminiText(responseBody);
        }

        private static CVFraudDetectionResponseDto ParseFraudResponse(string text)
        {
            var json = StripJsonFences(text);
            try
            {
                var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<CVFraudDetectionResponseDto>(json, opts)
                    ?? FallbackFraud();
            }
            catch (JsonException)
            {
                return FallbackFraud();
            }
        }

        private static CVFraudDetectionResponseDto FallbackFraud() => new()
        {
            IsSuspicious = false,
            RiskLevel    = "low",
            IssuesFound  = [],
            FinalVerdict = "trusted"
        };

        private static string StripJsonFences(string text)
        {
            text = text.Trim();

            var fence = Regex.Match(text, @"```(?:json)?\s*([\s\S]*?)```", RegexOptions.IgnoreCase);
            if (fence.Success)
                return fence.Groups[1].Value.Trim();

            var start = text.IndexOf('{');
            var end   = text.LastIndexOf('}');
            if (start >= 0 && end > start)
                return text[start..(end + 1)];

            return text;
        }

        // ── Hiring Recommendation ─────────────────────────────────────────────────

        public async Task<HiringRecommendationResponseDto> GenerateHiringRecommendationAsync(
            HiringRecommendationRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
                throw new InvalidOperationException(
                    "Gemini API key is not configured. Set GeminiSettings:ApiKey in appsettings.json.");

            // Cache key is derived from the three inputs serialised
            var inputHash = ComputeCacheKey(
                JsonSerializer.Serialize(request.SemanticAnalysis),
                "hire",
                $"{JsonSerializer.Serialize(request.FraudResult)}|{request.MatchScore}");

            if (_cache.TryGetValue(inputHash, out HiringRecommendationResponseDto? cached) && cached is not null)
            {
                _logger.LogInformation("[CACHE HIT] hiring key={Key}", inputHash);
                return cached;
            }

            var prompt  = BuildHiringPrompt(request);
            var rawText = await CallGeminiHiringAsync(prompt);
            var result  = ParseHiringResponse(rawText);

            _cache.Set(inputHash, result, TimeSpan.FromHours(1));
            _logger.LogInformation("[CACHE MISS] Hiring recommendation complete. key={Key}", inputHash);

            return result;
        }

        private static string BuildHiringPrompt(HiringRecommendationRequestDto req)
        {
            var sem   = req.SemanticAnalysis;
            var fraud = req.FraudResult;

            var fraudSummary = fraud.IsSuspicious
                ? $"SUSPICIOUS — {fraud.RiskLevel} risk. Verdict: {fraud.FinalVerdict}. " +
                  $"Issues: {string.Join("; ", fraud.IssuesFound.Select(i => i.Issue))}"
                : $"CLEAN — {fraud.FinalVerdict}. No issues found.";

            var keyAreas  = sem.KeyMatchingAreas.Count  > 0 ? string.Join(", ", sem.KeyMatchingAreas)  : "none";
            var missing   = sem.MissingCriticalSkills.Count > 0 ? string.Join(", ", sem.MissingCriticalSkills) : "none";
            var fraudFlags = sem.FraudIndicators.Count > 0 ? string.Join(", ", sem.FraudIndicators) : "none";

            return $$"""
                You are a Senior Recruitment AI Advisor.

                Combine the structured inputs below into a final hiring recommendation.

                RULES:
                - Trust the system match score for the numeric dimension
                - Trust the AI modules ONLY for reasoning and risk signals
                - Be objective and HR-like — no sentiment, no guessing
                - finalScore must be a number between 0 and 100
                - finalDecision must be exactly one of: strong_hire, hire, neutral, reject
                - riskAssessment must be exactly one of: low, medium, high

                INPUT DATA:

                System Match Score: {{req.MatchScore}}/100

                Semantic Analysis Summary:
                  Match Analysis : {{sem.SemanticMatchAnalysis}}
                  Key Matching Areas : {{keyAreas}}
                  Missing Critical Skills : {{missing}}
                  Experience Quality : {{sem.ExperienceQuality}}
                  Consistency Check : {{sem.ConsistencyCheck}}
                  Semantic Fraud Indicators : {{fraudFlags}}
                  Overall Insight : {{sem.OverallInsight}}

                Fraud Detection Summary:
                  {{fraudSummary}}

                Return ONLY valid JSON — no markdown fences, no extra text:
                {
                  "finalDecision": "strong_hire | hire | neutral | reject",
                  "finalScore": <number 0-100>,
                  "reasoning": "clear explanation combining all three factors",
                  "riskAssessment": "low | medium | high",
                  "recommendation": "specific actionable next step for the hiring team"
                }
                """;
        }

        private async Task<string> CallGeminiHiringAsync(string prompt)
        {
            var body = new
            {
                contents = new[] { new { parts = new[] { new { text = prompt } } } },
                generationConfig = new { temperature = 0.1, maxOutputTokens = 800, thinkingConfig = new { thinkingBudget = 0 } }
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
                throw new TimeoutException("Gemini hiring recommendation timed out after 30 seconds.");
            }

            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                var code = (int)response.StatusCode;
                _logger.LogError("Gemini hiring {StatusCode}: {Body}", code, responseBody);

                throw code switch
                {
                    429 => new InvalidOperationException("QUOTA_EXCEEDED"),
                    400 => new InvalidOperationException($"Gemini bad request: {responseBody}"),
                    401 or 403 => new UnauthorizedAccessException("Invalid or missing Gemini API key."),
                    _ => new InvalidOperationException($"Gemini returned {code}: {responseBody}")
                };
            }

            return ExtractGeminiText(responseBody);
        }

        private static HiringRecommendationResponseDto ParseHiringResponse(string text)
        {
            var json = StripJsonFences(text);
            try
            {
                var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<HiringRecommendationResponseDto>(json, opts)
                    ?? FallbackHiring();
            }
            catch (JsonException)
            {
                return FallbackHiring();
            }
        }

        private static HiringRecommendationResponseDto FallbackHiring() => new()
        {
            FinalDecision  = "neutral",
            FinalScore     = 50,
            Reasoning      = "Recommendation could not be generated. Please review candidate manually.",
            RiskAssessment = "medium",
            Recommendation = "Conduct a manual review before making a hiring decision."
        };

        // ── Unified Job Matching Engine ───────────────────────────────────────────
        //
        // Single Gemini call that:
        //   1. Receives both CV and job description together
        //   2. Understands both semantically (not just keyword-counting)
        //   3. Handles tech synonyms (JS = JavaScript, .NET = ASP.NET, etc.)
        //   4. Produces match score, skill diff, summary, and advisor guidance
        //
        // Local pre-analysis runs first at zero AI cost and feeds keyword hints
        // into the prompt so Gemini can focus on semantic reasoning.

        private const int MaxCvCharsForMatch  = 6_000;
        private const int MaxJobCharsForMatch = 2_000;

        public async Task<JobMatchResponseDto> MatchCvToJobAsync(
            string cvText, string jobTitle, string jobDescription)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
                throw new InvalidOperationException(
                    "Gemini API key is not configured. Set GeminiSettings:ApiKey in appsettings.json.");

            // ── 1. Cache check ────────────────────────────────────────────────────
            var cacheKey = ComputeCacheKey(cvText, "match|" + jobTitle, jobDescription);

            if (_cache.TryGetValue(cacheKey, out JobMatchResponseDto? cached) && cached is not null)
            {
                _logger.LogInformation("[CACHE HIT] unified-match key={Key}", cacheKey);
                return cached;
            }

            // ── 2. Local pre-analysis (free — used as semantic hints for Gemini) ──
            var local = _localAnalyzer.Analyze(cvText, jobTitle, jobDescription);

            // ── 3. Truncate inputs to stay in optimal Gemini context window ────────
            var truncCv  = cvText.Length        > MaxCvCharsForMatch  ? cvText[..MaxCvCharsForMatch]        : cvText;
            var truncJob = jobDescription.Length > MaxJobCharsForMatch ? jobDescription[..MaxJobCharsForMatch] : jobDescription;

            // ── 4. Single unified Gemini call ─────────────────────────────────────
            var prompt  = BuildUnifiedMatchPrompt(jobTitle, truncJob, truncCv,
                                                  local.MatchedSkills, local.MissingSkills);
            var rawText = await CallGeminiUnifiedAsync(prompt);
            var result  = ParseMatchResult(rawText);

            // ── 5. Safety anchor — prevent falsely high scores on zero skill match ─
            //    If the local keyword pass found zero overlapping skills, halve Gemini's
            //    score. This guards against prompt-injected CVs or generic CVs that
            //    describe adjacent roles in convincing prose.
            if (local.MatchPercentage == 0 && result.MatchScore > 40)
                result.MatchScore = Math.Round(result.MatchScore * 0.5, 1);

            // ── 6. Supplement empty skill lists from local analysis ────────────────
            if (result.MatchedSkills.Count == 0 && local.MatchedSkills.Count > 0)
                result.MatchedSkills = local.MatchedSkills.Take(10).ToList();

            if (result.MissingSkills.Count == 0 && local.MissingSkills.Count > 0)
                result.MissingSkills = local.MissingSkills.Take(10).ToList();

            // ── 7. Always populate KeywordGaps from local analysis (no AI cost) ────
            result.KeywordGaps = local.KeywordMissing.Take(8).ToList();

            // ── 8. Cache for 1 hour ───────────────────────────────────────────────
            _cache.Set(cacheKey, result, TimeSpan.FromHours(1));
            _logger.LogInformation(
                "[CACHE MISS] Unified match complete. Score={Score} key={Key}",
                result.MatchScore, cacheKey);

            return result;
        }

        private static string BuildUnifiedMatchPrompt(
            string jobTitle,
            string jobDescription,
            string cvText,
            List<string> localMatched,
            List<string> localMissing)
        {
            var hintMatched = localMatched.Count > 0 ? string.Join(", ", localMatched) : "none detected";
            var hintMissing = localMissing.Count > 0 ? string.Join(", ", localMissing) : "none detected";

            return $$"""
                You are an AI Job Matching Engine. Your task is to analyze the candidate CV and the Job Description TOGETHER in a single unified flow — not separately.

                SYNONYM EQUIVALENCE — treat each group as the same technology:
                - JavaScript / JS / ECMAScript / Node.js / NodeJS
                - TypeScript / TS
                - C# / .NET / ASP.NET / ASP.NET Core / Microsoft .NET
                - React / ReactJS / React.js
                - Vue / VueJS / Vue.js / Vue3
                - Angular / AngularJS
                - Python / py
                - Machine Learning / ML / Artificial Intelligence / AI / Deep Learning
                - Kubernetes / K8s / container orchestration
                - Docker / containerization / containers
                - SQL Server / MSSQL / Microsoft SQL / T-SQL
                - PostgreSQL / Postgres / PG
                - MongoDB / Mongo / NoSQL document store
                - REST / RESTful / REST API / Web API / HTTP API
                - Git / GitHub / GitLab / version control
                - CI/CD / DevOps / GitHub Actions / Azure DevOps / Jenkins

                System keyword pre-analysis (use as starting hints — override with your semantic judgment):
                Keyword-matched skills : {{hintMatched}}
                Keyword-missing skills : {{hintMissing}}

                Job Title: {{jobTitle}}

                Job Description:
                {{jobDescription}}

                Candidate CV:
                {{cvText}}

                Return ONLY valid JSON — no markdown fences, no extra text:
                {
                  "matchScore": <integer 0-100>,
                  "matchedSkills": ["skill1", "skill2"],
                  "missingSkills": ["skill3"],
                  "summary": "2-3 sentence objective assessment of candidate fit",
                  "weakSections": [
                    "Section name + why it is weak (e.g., Experience section lacks measurable achievements)"
                  ],
                  "improvementSuggestions": [
                    "Specific actionable step (e.g., Add Docker to Skills section)"
                  ]
                }

                Scoring guide:
                90-100 : Exceptional — candidate clearly exceeds requirements
                75-89  : Strong — candidate fits most requirements well
                55-74  : Partial — meets core requirements, notable gaps exist
                35-54  : Weak — significant skill or experience gaps
                0-34   : Poor — profile does not align with the role

                Output rules:
                - matchScore: integer 0-100 based on semantic understanding, not keyword counting
                - matchedSkills: use canonical skill names (e.g. "JavaScript" not "JS"); include all synonymous matches
                - missingSkills: only list skills the role clearly requires that are genuinely absent from the CV
                - summary: objective 2-3 sentences; base conclusions only on evidence present in the CV text
                - weakSections: 2-4 items; name the section and explain the weakness concisely
                - improvementSuggestions: 2-4 items; start each with an action verb (Add, Include, Quantify, Remove)
                - Never invent information not present in the CV
                - Never penalise the candidate for skills the job did not require
                """;
        }

        private async Task<string> CallGeminiUnifiedAsync(string prompt)
        {
            var body = new
            {
                contents         = new[] { new { parts = new[] { new { text = prompt } } } },
                generationConfig = new
                {
                    temperature     = 0.1,
                    maxOutputTokens = 1_200,
                    thinkingConfig  = new { thinkingBudget = 0 }
                }
            };

            var content = new StringContent(
                JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(45));
            HttpResponseMessage response;

            try
            {
                response = await _httpClient.PostAsync(
                    $"{_geminiUrl}?key={_apiKey}", content, cts.Token);
            }
            catch (TaskCanceledException)
            {
                throw new TimeoutException("Unified match analysis timed out after 45 seconds.");
            }

            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                var code = (int)response.StatusCode;
                _logger.LogError("Gemini unified match {StatusCode}: {Body}", code, responseBody);

                throw code switch
                {
                    429       => new InvalidOperationException("QUOTA_EXCEEDED"),
                    400       => new InvalidOperationException($"Gemini bad request: {responseBody}"),
                    401 or 403 => new UnauthorizedAccessException("Invalid or missing Gemini API key."),
                    _         => new InvalidOperationException($"Gemini returned {code}: {responseBody}")
                };
            }

            return ExtractGeminiText(responseBody);
        }

        private static JobMatchResponseDto ParseMatchResult(string text)
        {
            var json = StripJsonFences(text);
            try
            {
                var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var dto  = JsonSerializer.Deserialize<GeminiMatchResultDto>(json, opts);

                if (dto is null) return FallbackMatchResult();

                return new JobMatchResponseDto
                {
                    MatchScore             = Math.Clamp(dto.MatchScore, 0, 100),
                    MatchedSkills          = dto.MatchedSkills          ?? [],
                    MissingSkills          = dto.MissingSkills          ?? [],
                    Summary                = string.IsNullOrWhiteSpace(dto.Summary)
                                                ? "Analysis complete. Review matched and missing skills for details."
                                                : dto.Summary,
                    WeakSections           = dto.WeakSections           ?? [],
                    ImprovementSuggestions = dto.ImprovementSuggestions ?? [],
                };
            }
            catch (JsonException)
            {
                return FallbackMatchResult();
            }
        }

        private static JobMatchResponseDto FallbackMatchResult() => new()
        {
            MatchScore             = 0,
            MatchedSkills          = [],
            MissingSkills          = [],
            Summary                = "Analysis could not be completed. Please try again.",
            WeakSections           = [],
            ImprovementSuggestions = []
        };
    }
}
