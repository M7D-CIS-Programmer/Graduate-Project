/*
 * GeminiResumeService.cs
 * ─────────────────────────────────────────────────────────────────────────────
 * Production-ready Gemini API integration for AI-driven resume analysis.
 *
 * Fixes addressed:
 *   • 404 NotFound  → Uses verified gemini-1.5-flash endpoint on /v1beta
 *   • 429 RateLimit → Exponential backoff (2 s → 4 s → 8 s) up to MaxRetries
 *
 * Design decisions:
 *   • IHttpClientFactory  → named "GeminiResume" client (proper lifetime mgmt)
 *   • Custom exceptions   → GeminiRateLimitException signals the retry loop
 *   • Jitter on delay     → avoids thundering-herd when multiple requests hit
 *   • temperature = 0.1   → deterministic structured output
 *   • Prompt forces JSON  → no markdown fences in response
 * ─────────────────────────────────────────────────────────────────────────────
 */

using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace aabu_project.Services
{
    // ═══════════════════════════════════════════════════════════════════════════
    // Result DTOs
    // ═══════════════════════════════════════════════════════════════════════════

    public sealed class ResumeAnalysisResult
    {
        public string              Summary    { get; set; } = string.Empty;
        public List<string>        Skills     { get; set; } = new();
        public List<ExperienceItem> Experience { get; set; } = new();
        public List<EducationItem>  Education  { get; set; } = new();
    }

    public sealed class ExperienceItem
    {
        public string JobTitle    { get; set; } = string.Empty;
        public string Company     { get; set; } = string.Empty;
        public string Duration    { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public sealed class EducationItem
    {
        public string Degree      { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public string Year        { get; set; } = string.Empty;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Custom Exceptions
    // ═══════════════════════════════════════════════════════════════════════════

    /// <summary>Thrown when Gemini returns HTTP 429. Signals the retry loop.</summary>
    public sealed class GeminiRateLimitException : Exception
    {
        public TimeSpan? RetryAfter { get; }

        public GeminiRateLimitException(string message, TimeSpan? retryAfter = null)
            : base(message) => RetryAfter = retryAfter;
    }

    /// <summary>Thrown for non-429 Gemini API errors (4xx/5xx).</summary>
    public sealed class GeminiApiException : Exception
    {
        public int StatusCode { get; }

        public GeminiApiException(int statusCode, string message)
            : base(message) => StatusCode = statusCode;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Interface
    // ═══════════════════════════════════════════════════════════════════════════

    public interface IGeminiResumeService
    {
        /// <summary>
        /// Sends resume text to Gemini and returns structured analysis
        /// (skills, experience, education, summary).
        /// </summary>
        Task<ResumeAnalysisResult> AnalyzeResumeAsync(
            string resumeText,
            CancellationToken cancellationToken = default);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Service Implementation
    // ═══════════════════════════════════════════════════════════════════════════

    public sealed class GeminiResumeService : IGeminiResumeService
    {
        // ── Retry configuration ───────────────────────────────────────────────
        // Model and base URL come from GeminiSettings in appsettings.json.

        // ── Named HttpClient key (registered in Program.cs) ───────────────────
        public const string HttpClientName = "GeminiResume";

        // ── Retry configuration ───────────────────────────────────────────────
        private const int    MaxRetries   = 3;
        private const double BaseDelaySec = 2.0;  // 2 s, 4 s, 8 s …
        private const double MaxDelaySec  = 32.0; // cap at 32 s

        // ── JSON deserializer options ─────────────────────────────────────────
        private static readonly JsonSerializerOptions _jsonOpts = new()
        {
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        private readonly IHttpClientFactory _factory;
        private readonly IConfiguration     _config;
        private readonly ILogger<GeminiResumeService> _logger;

        public GeminiResumeService(
            IHttpClientFactory factory,
            IConfiguration     config,
            ILogger<GeminiResumeService> logger)
        {
            _factory = factory;
            _config  = config;
            _logger  = logger;
        }

        // ── Public API ────────────────────────────────────────────────────────

        public async Task<ResumeAnalysisResult> AnalyzeResumeAsync(
            string resumeText,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(resumeText))
                throw new ArgumentException("Resume text cannot be empty.", nameof(resumeText));

            var apiKey = _config["GeminiSettings:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
                throw new InvalidOperationException(
                    "Gemini API key is not configured. " +
                    "Set GeminiSettings:ApiKey in appsettings.json or environment variables.");

            var model       = _config["GeminiSettings:ModelName"] ?? "gemini-1.5-flash";
            var baseUrl     = _config["GeminiSettings:BaseUrl"]   ?? "https://generativelanguage.googleapis.com/v1beta/models";
            var apiEndpoint = $"{baseUrl}/{model}:generateContent";
            var url         = $"{apiEndpoint}?key={apiKey}";
            var prompt      = BuildPrompt(resumeText);

            _logger.LogInformation(
                "Starting resume analysis with {Model} (max {Max} attempts).", model, MaxRetries);

            var rawText = await ExecuteWithExponentialBackoffAsync(
                () => PostToGeminiAsync(url, prompt, cancellationToken),
                cancellationToken);

            return ParseStructuredResponse(rawText);
        }

        // ═════════════════════════════════════════════════════════════════════
        // Prompt
        // ═════════════════════════════════════════════════════════════════════

        private static string BuildPrompt(string resumeText) => $$"""
            You are an expert CV parser. Analyze the resume below and extract structured information.

            IMPORTANT: Return ONLY a valid JSON object.
            Do NOT include markdown formatting, code fences, or any text outside the JSON.

            Required JSON structure (follow exactly):
            {
              "summary": "2-3 sentence professional overview of the candidate",
              "skills": ["skill1", "skill2", "skill3"],
              "experience": [
                {
                  "jobTitle": "Job Title",
                  "company": "Company Name",
                  "duration": "Jan 2020 - Dec 2022",
                  "description": "Key responsibilities and achievements"
                }
              ],
              "education": [
                {
                  "degree": "Bachelor of Computer Science",
                  "institution": "University Name",
                  "year": "2019"
                }
              ]
            }

            Rules:
            - skills: list all technical and soft skills found
            - experience: list all work experience entries (most recent first)
            - education: list all educational qualifications
            - Return valid JSON only — no extra commentary

            Resume:
            {{resumeText}}
            """;

        // ═════════════════════════════════════════════════════════════════════
        // HTTP Layer
        // ═════════════════════════════════════════════════════════════════════

        private async Task<string> PostToGeminiAsync(
            string url, string prompt, CancellationToken ct)
        {
            // Create a fresh client from the factory (IHttpClientFactory manages pooling)
            var client = _factory.CreateClient(HttpClientName);

            // ✅ Exact Gemini API request body
            var body = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature     = 0.1,
                    maxOutputTokens = 2048,
                    topP            = 0.95,
                    thinkingConfig  = new { thinkingBudget = 0 }
                }
            };

            using var requestContent = new StringContent(
                JsonSerializer.Serialize(body),
                Encoding.UTF8,
                "application/json");

            _logger.LogDebug("Posting to Gemini endpoint: {Url}", url.Split('?')[0]);

            var response = await client.PostAsync(url, requestContent, ct);
            var raw      = await response.Content.ReadAsStringAsync(ct);

            // ── Handle error codes ────────────────────────────────────────────

            if (response.StatusCode == HttpStatusCode.TooManyRequests) // 429
            {
                // Honor Retry-After header if present
                TimeSpan? retryAfter = null;
                if (response.Headers.TryGetValues("Retry-After", out var values)
                    && int.TryParse(values.FirstOrDefault(), out var sec))
                {
                    retryAfter = TimeSpan.FromSeconds(sec);
                }

                throw new GeminiRateLimitException(
                    $"HTTP 429 from Gemini. Body: {raw[..Math.Min(200, raw.Length)]}",
                    retryAfter);
            }

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError(
                    "Gemini API error {Status}: {Body}",
                    (int)response.StatusCode,
                    raw[..Math.Min(500, raw.Length)]);

                throw new GeminiApiException(
                    (int)response.StatusCode,
                    $"Gemini API returned {(int)response.StatusCode}: {raw}");
            }

            return ExtractCandidateText(raw);
        }

        // ─────────────────────────────────────────────────────────────────────

        private static string ExtractCandidateText(string responseBody)
        {
            using var doc = JsonDocument.Parse(responseBody);
            var root      = doc.RootElement;

            if (!root.TryGetProperty("candidates", out var candidates)
                || candidates.GetArrayLength() == 0)
                throw new InvalidOperationException(
                    "Gemini returned no candidates. " +
                    $"Response preview: {responseBody[..Math.Min(300, responseBody.Length)]}");

            var finishReason = candidates[0]
                .TryGetProperty("finishReason", out var fr) ? fr.GetString() : "UNKNOWN";

            if (finishReason is "SAFETY" or "RECITATION")
                throw new InvalidOperationException(
                    $"Gemini blocked the response (finishReason: {finishReason}). " +
                    "Try rephrasing the input.");

            return candidates[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString()
                ?? throw new InvalidOperationException("Gemini returned empty text.");
        }

        // ═════════════════════════════════════════════════════════════════════
        // Retry — Exponential Backoff with Jitter
        // ═════════════════════════════════════════════════════════════════════

        private async Task<string> ExecuteWithExponentialBackoffAsync(
            Func<Task<string>> operation,
            CancellationToken  ct)
        {
            var rng = new Random();

            for (int attempt = 1; attempt <= MaxRetries; attempt++)
            {
                try
                {
                    var result = await operation();

                    if (attempt > 1)
                        _logger.LogInformation("Gemini succeeded on attempt {Attempt}.", attempt);

                    return result;
                }
                catch (GeminiRateLimitException ex) when (attempt < MaxRetries)
                {
                    double delaySec;

                    if (ex.RetryAfter.HasValue)
                    {
                        // Respect Retry-After header from Google
                        delaySec = ex.RetryAfter.Value.TotalSeconds;
                        _logger.LogWarning(
                            "Gemini 429 — Retry-After header says {Sec}s. " +
                            "Attempt {A}/{Max}.",
                            delaySec, attempt, MaxRetries);
                    }
                    else
                    {
                        // Exponential backoff: 2, 4, 8, … capped at MaxDelaySec
                        var exponential = BaseDelaySec * Math.Pow(2, attempt - 1);
                        var capped      = Math.Min(exponential, MaxDelaySec);

                        // ±20% jitter to spread retries across concurrent callers
                        var jitter = capped * 0.2 * (rng.NextDouble() * 2 - 1);
                        delaySec   = Math.Max(1, capped + jitter);

                        _logger.LogWarning(
                            "Gemini 429 — waiting {Delay:F1}s before retry {A}/{Max}. " +
                            "Error: {Msg}",
                            delaySec, attempt, MaxRetries, ex.Message);
                    }

                    await Task.Delay(TimeSpan.FromSeconds(delaySec), ct);
                }
                catch (GeminiRateLimitException ex) // all retries exhausted
                {
                    _logger.LogError(
                        ex,
                        "Gemini rate limit persists after {Max} attempts. Giving up.",
                        MaxRetries);

                    throw new InvalidOperationException(
                        "The AI service is temporarily busy due to rate limiting. " +
                        "Please wait a few minutes and try again.", ex);
                }
                // GeminiApiException and all others propagate immediately (no retry)
            }

            // Should never reach here — compiler guard
            throw new InvalidOperationException("Unexpected state in retry loop.");
        }

        // ═════════════════════════════════════════════════════════════════════
        // Response Parsing
        // ═════════════════════════════════════════════════════════════════════

        private static ResumeAnalysisResult ParseStructuredResponse(string text)
        {
            var json = CleanJson(text);

            try
            {
                var result = JsonSerializer.Deserialize<ResumeAnalysisResult>(json, _jsonOpts);
                return result ?? throw new InvalidOperationException("Deserialization returned null.");
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException(
                    $"Gemini response was not valid JSON: {ex.Message}. " +
                    $"Raw preview: {text[..Math.Min(400, text.Length)]}", ex);
            }
        }

        /// <summary>
        /// Strips markdown code fences and finds the outermost JSON object.
        /// Handles common Gemini quirks like ```json ... ``` wrappers.
        /// </summary>
        private static string CleanJson(string text)
        {
            text = text.Trim();

            // Remove ```json ... ``` or ``` ... ```
            var fence = Regex.Match(
                text, @"```(?:json)?\s*([\s\S]*?)```",
                RegexOptions.IgnoreCase);

            if (fence.Success)
                return fence.Groups[1].Value.Trim();

            // Find outermost { }
            var start = text.IndexOf('{');
            var end   = text.LastIndexOf('}');

            if (start >= 0 && end > start)
                return text[start..(end + 1)];

            return text; // last resort — return as-is
        }
    }
}
