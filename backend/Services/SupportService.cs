using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using aabu_project.Dtos;
using Microsoft.Extensions.Caching.Memory;

namespace aabu_project.Services
{
    // ── Dataset shapes ────────────────────────────────────────────────────────

    internal sealed class ChatbotIntent
    {
        public string        Intent      { get; set; } = string.Empty;
        public string        Group       { get; set; } = string.Empty;
        public List<string>  Patterns    { get; set; } = new();
        public string        ResponseAr  { get; set; } = string.Empty;
        public string        ResponseEn  { get; set; } = string.Empty;
    }

    internal sealed class ChatbotDataset
    {
        public List<ChatbotIntent> Intents { get; set; } = new();
    }

    // ── Service ───────────────────────────────────────────────────────────────

    public sealed class SupportService : ISupportService
    {
        private readonly HttpClient   _http;
        private readonly IMemoryCache _cache;
        private readonly string       _apiKey;
        private readonly ILogger<SupportService> _logger;

        // Loaded from chatbot_dataset.json at startup
        private readonly List<ChatbotIntent> _intents;
        private readonly ChatbotIntent?      _fallbackIntent;

        private const string GeminiUrl =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

        private const string SystemPrompt = """
            You are a concise support assistant for InsightCV — a professional job platform.
            Features: CV Analyzer (ATS scoring, job match), AI Interview Simulator (5-question mock),
            Job Search (filter/apply/save), Resume Builder (PDF export), User Profiles, Notifications.
            Only answer questions about this platform. If unrelated: say you only assist with InsightCV topics.
            Keep replies to 2-4 sentences. Be friendly and accurate.
            """;

        private static readonly JsonSerializerOptions JsonOpts =
            new() { PropertyNameCaseInsensitive = true };

        private static readonly JsonDocumentOptions JsonDocOpts =
            new() { CommentHandling = JsonCommentHandling.Skip };

        public SupportService(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<SupportService> logger,
            IMemoryCache cache,
            IWebHostEnvironment env)
        {
            _http   = httpClient;
            _logger = logger;
            _cache  = cache;
            _apiKey = configuration["GeminiSettings:ApiKey"] ?? string.Empty;

            (_intents, _fallbackIntent) = LoadDataset(env.ContentRootPath, logger);
        }

        // ── Main entry point ──────────────────────────────────────────────────

        public async Task<SupportChatResponseDto> ChatAsync(string message)
        {
            var cacheKey = "support:" + HashMessage(message);

            // 1. Instant cache hit
            if (_cache.TryGetValue(cacheKey, out string? cached) && cached is not null)
            {
                _logger.LogInformation("[SUPPORT CACHE HIT] key={Key}", cacheKey);
                return new SupportChatResponseDto { Reply = cached, Cached = true };
            }

            // 2. Match against dataset patterns (zero AI tokens)
            var isArabic = IsArabic(message);
            var matched  = MatchIntent(message);

            if (matched is not null)
            {
                var reply = isArabic ? matched.ResponseAr : matched.ResponseEn;
                _logger.LogInformation("[SUPPORT DATASET MATCH] intent={I}", matched.Intent);
                _cache.Set(cacheKey, reply, TimeSpan.FromHours(2));
                return new SupportChatResponseDto { Reply = reply, Cached = false };
            }

            // 3. No match → try Gemini for novel questions
            if (string.IsNullOrWhiteSpace(_apiKey))
                return Fallback(isArabic);

            try
            {
                var reply = await CallGeminiAsync(message);
                _cache.Set(cacheKey, reply, TimeSpan.FromMinutes(30));
                return new SupportChatResponseDto { Reply = reply, Cached = false };
            }
            catch (InvalidOperationException ex) when (ex.Message == "QUOTA_EXCEEDED")
            {
                _logger.LogWarning("[SUPPORT] Gemini quota hit — returning smart fallback.");
                return BuildQuotaFallback(message, isArabic);
            }
        }

        // ── Dataset matching ──────────────────────────────────────────────────

        private ChatbotIntent? MatchIntent(string message)
        {
            // Normalise BOTH sides so Arabic script differences don't block matches
            var normMsg = NormalizeForMatching(message);

            foreach (var intent in _intents)
            {
                if (intent.Intent == "unknown") continue;

                foreach (var pattern in intent.Patterns)
                {
                    var normPattern = NormalizeForMatching(pattern);
                    if (normMsg.Contains(normPattern, StringComparison.OrdinalIgnoreCase))
                        return intent;
                }
            }

            return null;
        }

        // ── Arabic + English normalization ────────────────────────────────────
        //
        // Why this matters:
        //   User types:    للاعدادات  (plain alef ا)
        //   Pattern has:   الإعدادات  (alef-hamza إ)
        //   After norm:    both become  الاعدادات  → match succeeds
        //
        // Rules applied:
        //   1. Alef variants (أ إ آ ٱ) → plain alef ا
        //   2. Teh marbuta (ة)          → هـ  (avoids singular/plural misses)
        //   3. Alef maqsura (ى)         → ي
        //   4. Tashkeel / harakat        stripped (U+064B – U+065F, U+0670)
        //   5. Tatweel (ـ)              stripped
        //   6. English                  lowercased
        // ─────────────────────────────────────────────────────────────────────
        private static string NormalizeForMatching(string text)
        {
            if (string.IsNullOrEmpty(text)) return text;

            var sb = new System.Text.StringBuilder(text.Length);

            foreach (var ch in text)
            {
                switch (ch)
                {
                    // Alef variants → plain alef
                    case 'أ': case 'إ': case 'آ': case 'ٱ':
                        sb.Append('ا');
                        break;

                    // Teh marbuta → ha (أنظمة/نظام plural matching)
                    case 'ة':
                        sb.Append('ه');
                        break;

                    // Alef maqsura → ya
                    case 'ى':
                        sb.Append('ي');
                        break;

                    // Tatweel → skip
                    case 'ـ':
                        break;

                    // Tashkeel / harakat range U+064B–U+065F and U+0670 → skip
                    default:
                        if ((ch >= 'ً' && ch <= 'ٟ') || ch == 'ٰ')
                            break;
                        sb.Append(char.ToLowerInvariant(ch));
                        break;
                }
            }

            return sb.ToString();
        }

        // ── Language detection ────────────────────────────────────────────────

        private static bool IsArabic(string text) =>
            Regex.IsMatch(text, @"[؀-ۿ]");

        // ── Fallbacks ─────────────────────────────────────────────────────────

        private SupportChatResponseDto Fallback(bool arabic)
        {
            if (_fallbackIntent is null)
                return new SupportChatResponseDto
                {
                    Reply = arabic
                        ? "ممكن توضح سؤالك أكثر؟ أنا هون لمساعدتك 😊"
                        : "Can you clarify your question? I'm here to help 😊"
                };

            return new SupportChatResponseDto
            {
                Reply = arabic ? _fallbackIntent.ResponseAr : _fallbackIntent.ResponseEn
            };
        }

        private SupportChatResponseDto BuildQuotaFallback(string message, bool arabic)
        {
            var lower = message.ToLowerInvariant();

            string ar, en;

            if (lower.Contains("cv") || lower.Contains("resume") || lower.Contains("pdf") ||
                lower.Contains("سيرة") || lower.Contains("محلل"))
            {
                ar = "لاستخدام محلل CV: اذهب لـ 'محلل CV مقابل الوظيفة' من الشريط الجانبي، ارفع ملف PDF، وأدخل الوظيفة التي تريدها.";
                en = "To use CV Analyzer: go to 'CV vs Job Analyzer' from the sidebar, upload a PDF, and enter the job you want.";
            }
            else if (lower.Contains("interview") || lower.Contains("مقابل"))
            {
                ar = "لبدء المقابلة الذكية: اذهب لـ 'مقابلة الذكاء الاصطناعي'، أدخل المسمى الوظيفي والوصف، واضغط 'ابدأ المقابلة'.";
                en = "To start AI Interview: go to 'AI Interview', enter the job title and description, then click 'Start Interview'.";
            }
            else if (lower.Contains("job") || lower.Contains("apply") || lower.Contains("وظيف"))
            {
                ar = "للبحث عن وظائف: اضغط 'البحث عن وظائف' من الشريط الجانبي، استخدم الفلاتر، ثم اضغط 'قدم الآن'.";
                en = "To search for jobs: click 'Find Jobs' from the sidebar, use the filters, then click 'Apply Now'.";
            }
            else
            {
                ar  = "أنا هون لمساعدتك! اسألني عن:\n• محلل CV\n• مقابلة الذكاء الاصطناعي\n• البحث عن وظائف\n• الحساب والإعدادات";
                en  = "I'm here to help! Ask me about:\n• CV Analyzer\n• AI Interview\n• Job Search\n• Account & Settings";
            }

            return new SupportChatResponseDto { Reply = arabic ? ar : en };
        }

        // ── Gemini call ───────────────────────────────────────────────────────

        private async Task<string> CallGeminiAsync(string userMessage)
        {
            var body = new
            {
                systemInstruction = new { parts = new[] { new { text = SystemPrompt } } },
                contents = new[] { new { role = "user", parts = new[] { new { text = userMessage.Trim() } } } },
                generationConfig = new { temperature = 0.4, maxOutputTokens = 400 }
            };

            var content  = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(25));

            HttpResponseMessage response;
            try
            {
                response = await _http.PostAsync($"{GeminiUrl}?key={_apiKey}", content, cts.Token);
            }
            catch (TaskCanceledException)
            {
                throw new TimeoutException("AI took too long to respond. Please try again.");
            }

            var raw = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                var code = (int)response.StatusCode;
                _logger.LogError("Gemini support {Code}: {Body}", code, raw);
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

        // ── Dataset loading ───────────────────────────────────────────────────

        private static (List<ChatbotIntent> intents, ChatbotIntent? fallback) LoadDataset(
            string contentRoot, ILogger logger)
        {
            var path = Path.Combine(contentRoot, "Data", "chatbot_dataset.json");

            if (!File.Exists(path))
            {
                logger.LogWarning("chatbot_dataset.json not found at {Path}. Using empty dataset.", path);
                return (new List<ChatbotIntent>(), null);
            }

            try
            {
                var json = File.ReadAllText(path);

                // Parse with comment support (our JSON uses // comments)
                using var doc  = JsonDocument.Parse(json, JsonDocOpts);
                var intentsArr = doc.RootElement.GetProperty("intents");
                var allIntents = new List<ChatbotIntent>();

                foreach (var el in intentsArr.EnumerateArray())
                {
                    var intent = new ChatbotIntent
                    {
                        Intent     = el.TryGetProperty("intent",      out var i)    ? i.GetString()    ?? "" : "",
                        Group      = el.TryGetProperty("group",       out var g)    ? g.GetString()    ?? "" : "",
                        ResponseAr = el.TryGetProperty("response_ar", out var ar)   ? ar.GetString()   ?? "" : "",
                        ResponseEn = el.TryGetProperty("response_en", out var en)   ? en.GetString()   ?? "" : "",
                    };

                    if (el.TryGetProperty("patterns", out var pArr))
                        foreach (var p in pArr.EnumerateArray())
                        {
                            var pv = p.GetString();
                            if (!string.IsNullOrWhiteSpace(pv))
                                intent.Patterns.Add(pv);
                        }

                    allIntents.Add(intent);
                }

                var fallback = allIntents.FirstOrDefault(x => x.Intent == "unknown");
                var mainList = allIntents.Where(x => x.Intent != "unknown").ToList();

                logger.LogInformation(
                    "chatbot_dataset.json loaded: {Count} intents (excl. fallback).", mainList.Count);

                return (mainList, fallback);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to load chatbot_dataset.json.");
                return (new List<ChatbotIntent>(), null);
            }
        }

        // ── Cache key ─────────────────────────────────────────────────────────

        private static string HashMessage(string message)
        {
            var n = Regex.Replace(message.Trim().ToLowerInvariant(), @"\s+", " ");
            return "s:" + Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(n)))[..20];
        }
    }
}
