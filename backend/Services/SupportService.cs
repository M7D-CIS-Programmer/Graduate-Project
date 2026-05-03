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
        public string       Intent              { get; set; } = string.Empty;
        public string       Group               { get; set; } = string.Empty;
        /// <summary>"all" | "jobseeker" | "company"</summary>
        public string       Scope               { get; set; } = "all";
        public List<string> Patterns            { get; set; } = new();
        public List<string> Keywords            { get; set; } = new();
        // Generic (role-agnostic) responses
        public string       ResponseEn          { get; set; } = string.Empty;
        public string       ResponseAr          { get; set; } = string.Empty;
        // Role-specific responses (override generic when role is known)
        public string       ResponseJobSeekerEn { get; set; } = string.Empty;
        public string       ResponseJobSeekerAr { get; set; } = string.Empty;
        public string       ResponseCompanyEn   { get; set; } = string.Empty;
        public string       ResponseCompanyAr   { get; set; } = string.Empty;
    }

    internal sealed class ChatbotDataset
    {
        public List<ChatbotIntent> Intents { get; set; } = new();
    }

    // ── Service ───────────────────────────────────────────────────────────────

    public sealed class SupportService : ISupportService
    {
        private readonly HttpClient              _http;
        private readonly IMemoryCache            _cache;
        private readonly string                  _apiKey;
        private readonly string                  _geminiUrl;
        private readonly ILogger<SupportService> _logger;

        private readonly List<ChatbotIntent> _intents;
        private readonly ChatbotIntent?      _fallbackIntent;

        // Minimum score to accept a dataset match (prevents very loose hits)
        private const int MatchThreshold = 30;

        // ── Off-topic guard ────────────────────────────────────────────────────
        // If any of these terms appear in a message that has NO website-related
        // keywords, we reject it before spending Gemini tokens.
        private static readonly HashSet<string> OffTopicTerms = new(StringComparer.OrdinalIgnoreCase)
        {
            "cook","recipe","food","pasta","pizza","burger","restaurant",
            "weather","rain","temperature","forecast","climate",
            "sport","football","soccer","basketball","cricket","tennis","game",
            "movie","film","series","netflix","actor","music","song","singer",
            "politics","election","president","minister","war","army",
            "stock","crypto","bitcoin","forex","invest",
            "health","medicine","doctor","hospital","pill","disease","symptoms",
            "love","marriage","relationship","dating","girlfriend","boyfriend",
            "horoscope","zodiac","astrology",
            "طبخ","أكل","وصفة","طقس","مطر","سياسة","موسيقى","فيلم","طب","حب"
        };

        // Platform-related safety terms — presence of any of these means the
        // message is NOT off-topic even if it also contains an off-topic word.
        private static readonly HashSet<string> PlatformTerms = new(StringComparer.OrdinalIgnoreCase)
        {
            "job","work","career","resume","cv","apply","application","interview",
            "company","employer","profile","salary","hire","hiring","recruitment",
            "insightcv","platform","account","login","register","password","settings",
            "وظيف","عمل","مهن","سيرة","cv","تقدم","شركة","حساب","منصة","مقابل"
        };

        private static readonly JsonDocumentOptions JsonDocOpts =
            new() { CommentHandling = JsonCommentHandling.Skip };

        public SupportService(
            HttpClient          httpClient,
            IConfiguration      configuration,
            ILogger<SupportService> logger,
            IMemoryCache        cache,
            IWebHostEnvironment env)
        {
            _http   = httpClient;
            _logger = logger;
            _cache  = cache;
            _apiKey = configuration["GeminiSettings:ApiKey"] ?? string.Empty;

            var model   = configuration["GeminiSettings:ModelName"] ?? "gemini-2.5-flash";
            var baseUrl = configuration["GeminiSettings:BaseUrl"]
                          ?? "https://generativelanguage.googleapis.com/v1beta/models";
            _geminiUrl  = $"{baseUrl}/{model}:generateContent";

            (_intents, _fallbackIntent) = LoadDataset(env.ContentRootPath, logger);
        }

        // ── Public entry point ────────────────────────────────────────────────

        public async Task<SupportChatResponseDto> ChatAsync(string message, string role, string lang)
        {
            var normRole = NormalizeRole(role);
            lang         = LangHelper.Normalize(lang);
            // If user wrote Arabic, treat as Arabic regardless of lang param
            var isArabic = lang == "ar" || IsArabic(message);
            var cacheKey = $"support:{normRole}:{lang}:{HashMessage(message)}";

            // 1. Cache hit
            if (_cache.TryGetValue(cacheKey, out SupportChatResponseDto? cached) && cached is not null)
            {
                _logger.LogInformation("[SUPPORT CACHE HIT] key={Key}", cacheKey);
                cached.Cached = true;
                return cached;
            }

            // 2. Out-of-scope guard — refuse off-topic questions instantly
            if (IsOffTopic(message))
            {
                var refuse = BuildRefusalResponse(isArabic);
                _cache.Set(cacheKey, refuse, TimeSpan.FromHours(6));
                return refuse;
            }

            // 3. Dataset match — weighted keyword + pattern scoring
            var (matched, score) = ScoreIntents(message, normRole);

            if (matched is not null && score >= MatchThreshold)
            {
                var reply = PickResponse(matched, normRole, isArabic);
                _logger.LogInformation("[SUPPORT DATASET] intent={I} score={S}", matched.Intent, score);
                var dto = new SupportChatResponseDto { Reply = reply, Intent = matched.Intent };
                _cache.Set(cacheKey, dto, TimeSpan.FromHours(2));
                return dto;
            }

            // 4. Gemini for novel questions
            if (string.IsNullOrWhiteSpace(_apiKey))
                return Fallback(isArabic, normRole);

            try
            {
                var geminiReply = await CallGeminiAsync(message, normRole, isArabic, lang);
                var dto = new SupportChatResponseDto { Reply = geminiReply, Intent = "gemini" };
                _cache.Set(cacheKey, dto, TimeSpan.FromMinutes(30));
                return dto;
            }
            catch (InvalidOperationException ex) when (ex.Message == "QUOTA_EXCEEDED")
            {
                _logger.LogWarning("[SUPPORT] Gemini quota hit — smart fallback.");
                return BuildKeywordFallback(message, isArabic, normRole);
            }
        }

        // ── Role normalisation ────────────────────────────────────────────────

        private static string NormalizeRole(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return "guest";
            var r = raw.ToLowerInvariant().Trim();
            if (r is "employer" or "company") return "company";
            if (r.Contains("seeker") || r is "jobseeker" or "job seeker") return "jobseeker";
            if (r is "admin") return "admin";
            return "guest";
        }

        // ── Off-topic detection ───────────────────────────────────────────────

        private static bool IsOffTopic(string message)
        {
            var words = Regex.Split(message.ToLowerInvariant(), @"\W+");

            bool hasPlatformWord = words.Any(w => PlatformTerms.Contains(w));
            if (hasPlatformWord) return false;

            bool hasOffTopicWord = words.Any(w => OffTopicTerms.Contains(w));
            return hasOffTopicWord;
        }

        // ── Weighted intent scoring ───────────────────────────────────────────
        //
        //  Points per signal:
        //    • Pattern substring match   → +60
        //    • Keyword exact match       → +20 per keyword
        //    • Scope mismatch penalty    → −40  (intent is for the other role)
        //
        //  The intent with the highest score above MatchThreshold wins.
        // ─────────────────────────────────────────────────────────────────────

        private (ChatbotIntent? intent, int score) ScoreIntents(string message, string role)
        {
            var norm = NormalizeForMatching(message);
            ChatbotIntent? best = null;
            int bestScore = 0;

            foreach (var intent in _intents)
            {
                if (intent.Intent == "unknown") continue;

                int score = 0;

                // Pattern match
                foreach (var pattern in intent.Patterns)
                {
                    if (norm.Contains(NormalizeForMatching(pattern), StringComparison.OrdinalIgnoreCase))
                    {
                        score += 60;
                        break; // one match is enough
                    }
                }

                // Keyword match
                foreach (var kw in intent.Keywords)
                {
                    if (norm.Contains(NormalizeForMatching(kw), StringComparison.OrdinalIgnoreCase))
                        score += 20;
                }

                // Scope penalty
                if (intent.Scope != "all")
                {
                    bool intendedForJobSeeker = intent.Scope == "jobseeker";
                    bool callerIsJobSeeker    = role == "jobseeker";
                    if (intendedForJobSeeker != callerIsJobSeeker)
                        score -= 40;
                }

                if (score > bestScore)
                {
                    bestScore = score;
                    best      = intent;
                }
            }

            return (best, bestScore);
        }

        // ── Response picker (role + language aware) ───────────────────────────

        private static string PickResponse(ChatbotIntent intent, string role, bool arabic)
        {
            // Role-specific first
            if (role == "jobseeker")
            {
                if (arabic && !string.IsNullOrWhiteSpace(intent.ResponseJobSeekerAr))
                    return intent.ResponseJobSeekerAr;
                if (!arabic && !string.IsNullOrWhiteSpace(intent.ResponseJobSeekerEn))
                    return intent.ResponseJobSeekerEn;
            }
            else if (role == "company")
            {
                if (arabic && !string.IsNullOrWhiteSpace(intent.ResponseCompanyAr))
                    return intent.ResponseCompanyAr;
                if (!arabic && !string.IsNullOrWhiteSpace(intent.ResponseCompanyEn))
                    return intent.ResponseCompanyEn;
            }

            // Generic fallback
            return arabic
                ? (string.IsNullOrWhiteSpace(intent.ResponseAr) ? intent.ResponseEn : intent.ResponseAr)
                : (string.IsNullOrWhiteSpace(intent.ResponseEn) ? intent.ResponseAr : intent.ResponseEn);
        }

        // ── Fallbacks ─────────────────────────────────────────────────────────

        private static SupportChatResponseDto BuildRefusalResponse(bool arabic) =>
            new()
            {
                Reply = arabic
                    ? "أنا مساعد InsightCV ومتخصص فقط بأسئلة الموقع مثل: الوظائف، السيرة الذاتية، الحساب، والمقابلات. هل تحتاج مساعدة في أي من هذه المواضيع؟ 😊"
                    : "I only assist with InsightCV platform questions such as jobs, resume, account, and interviews. Is there anything about the platform I can help you with? 😊",
                Intent = "off_topic"
            };

        private SupportChatResponseDto Fallback(bool arabic, string role)
        {
            if (_fallbackIntent is not null)
                return new SupportChatResponseDto
                {
                    Reply  = PickResponse(_fallbackIntent, role, arabic),
                    Intent = "unknown"
                };

            return new SupportChatResponseDto
            {
                Reply = arabic
                    ? "ممكن توضح سؤالك أكثر؟ أنا هون لمساعدتك في أي شيء يتعلق بـ InsightCV 😊"
                    : "Could you clarify your question? I'm here to help with anything related to InsightCV 😊",
                Intent = "unknown"
            };
        }

        private SupportChatResponseDto BuildKeywordFallback(string message, bool arabic, string role)
        {
            var norm = message.ToLowerInvariant();

            string ar, en;

            if (norm.Contains("cv") || norm.Contains("resume") || norm.Contains("سيرة") || norm.Contains("محلل"))
            {
                ar = "لتحليل CV: اذهب إلى 'محلل CV' من القائمة الجانبية، ارفع ملف PDF وأدخل وصف الوظيفة.";
                en = "To analyze your CV: go to 'CV Analyzer' from the sidebar, upload a PDF and enter the job description.";
            }
            else if (norm.Contains("interview") || norm.Contains("مقابل"))
            {
                ar = "لبدء المقابلة الذكية: اذهب إلى 'محاكاة المقابلة' وأدخل المسمى الوظيفي وابدأ.";
                en = "For the AI Interview: go to 'AI Interview', enter the job title, and start your practice session.";
            }
            else if (norm.Contains("job") || norm.Contains("apply") || norm.Contains("وظيف") || norm.Contains("تقدم"))
            {
                if (role == "company")
                {
                    ar = "كشركة، يمكنك نشر الوظائف من خلال 'نشر وظيفة' في لوحة التحكم.";
                    en = "As a company, you can post jobs from 'Post a Job' in your dashboard.";
                }
                else
                {
                    ar = "للبحث عن وظائف: اضغط 'البحث عن وظائف'، استخدم الفلاتر، ثم اضغط 'قدّم الآن'.";
                    en = "To search for jobs: click 'Find Jobs', use the filters, then click 'Apply Now'.";
                }
            }
            else if (norm.Contains("account") || norm.Contains("login") || norm.Contains("password") ||
                     norm.Contains("حساب") || norm.Contains("كلمة") || norm.Contains("دخول"))
            {
                ar = "لمشاكل الحساب: تأكد من البريد وكلمة المرور، أو استخدم 'هل نسيت كلمة المرور'.";
                en = "For account issues: check your email and password, or use 'Forgot Password' to reset it.";
            }
            else
            {
                ar = "بقدر أساعدك في:\n• 📄 محلل CV\n• 🎤 مقابلة ذكية\n• 💼 البحث عن وظائف\n• 👤 الحساب والإعدادات";
                en = "I can help you with:\n• 📄 CV Analyzer\n• 🎤 AI Interview\n• 💼 Job Search\n• 👤 Account & Settings";
            }

            return new SupportChatResponseDto { Reply = arabic ? ar : en, Intent = "quota_fallback" };
        }

        // ── Gemini call ───────────────────────────────────────────────────────

        private async Task<string> CallGeminiAsync(string userMessage, string role, bool arabic, string lang)
        {
            var roleLabel = role switch
            {
                "jobseeker" => "Job Seeker",
                "company"   => "Employer / Company",
                "admin"     => "Admin",
                _           => "Guest (not logged in)"
            };

            var systemPrompt = $"""
                {LangHelper.GetInstruction(lang)}

                You are a professional support assistant for InsightCV — a bilingual (Arabic/English) job recruitment platform.

                CALLER ROLE: {roleLabel}

                PLATFORM FEATURES:
                For Job Seekers: browse and apply for jobs, build resume, CV analysis (ATS scoring + job match),
                AI interview practice (5-question mock with feedback), save jobs, follow companies,
                view application status (Applied → Reviewing → Shortlisted → Accepted/Rejected),
                messaging with employers, notifications.

                For Companies/Employers: post jobs, manage applicants, view candidate profiles,
                AI candidate insights, AI hiring report (ranked candidates), fraud detection on CVs,
                messaging with applicants, department management, follower system.

                STRICT RULES:
                1. ONLY answer questions about the InsightCV platform. Never answer unrelated questions.
                2. If question is unrelated (cooking, sports, politics, etc.), politely refuse and redirect.
                3. Always consider the caller role ({roleLabel}) and give role-appropriate guidance.
                4. If a Job Seeker asks something only a Company can do (e.g. post a job), explain the role difference.
                5. If a Company asks something only a Job Seeker can do (e.g. apply for a job), explain the role difference.
                6. Respond ONLY in {(lang == "ar" ? "Modern Standard Arabic (فصحى)" : "English")}. Never mix languages.
                7. Keep replies concise: 2–4 sentences, clear and actionable.
                8. Use bullet points for multi-step instructions.
                9. Be friendly, professional, and helpful.
                """;

            var body = new
            {
                systemInstruction = new { parts = new[] { new { text = systemPrompt } } },
                contents = new[]
                {
                    new { role = "user", parts = new[] { new { text = userMessage.Trim() } } }
                },
                generationConfig = new
                {
                    temperature      = 0.3,
                    maxOutputTokens  = 600,
                    thinkingConfig   = new { thinkingBudget = 0 }
                }
            };

            var content = new StringContent(
                JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(25));
            HttpResponseMessage response;

            try
            {
                response = await _http.PostAsync($"{_geminiUrl}?key={_apiKey}", content, cts.Token);
            }
            catch (TaskCanceledException)
            {
                throw new TimeoutException("AI took too long. Please try again.");
            }

            var raw = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                var code = (int)response.StatusCode;
                _logger.LogError("Gemini support {Code}: {Body}", code, raw);
                throw code switch
                {
                    429        => new InvalidOperationException("QUOTA_EXCEEDED"),
                    401 or 403 => new UnauthorizedAccessException("Invalid Gemini API key."),
                    _          => new InvalidOperationException($"Gemini returned {code}: {raw}")
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

        // ── Arabic + English normalisation ────────────────────────────────────

        private static string NormalizeForMatching(string text)
        {
            if (string.IsNullOrEmpty(text)) return text;
            var sb = new StringBuilder(text.Length);

            foreach (var ch in text)
            {
                switch (ch)
                {
                    case 'أ': case 'إ': case 'آ': case 'ٱ': sb.Append('ا'); break;
                    case 'ة': sb.Append('ه'); break;
                    case 'ى': sb.Append('ي'); break;
                    case 'ـ': break;
                    default:
                        if ((ch >= 'ً' && ch <= 'ٟ') || ch == 'ٰ') break;
                        sb.Append(char.ToLowerInvariant(ch));
                        break;
                }
            }

            return sb.ToString();
        }

        private static bool IsArabic(string text) =>
            Regex.IsMatch(text, @"[؀-ۿ]");

        // ── Dataset loading ───────────────────────────────────────────────────

        private static (List<ChatbotIntent> intents, ChatbotIntent? fallback) LoadDataset(
            string contentRoot, ILogger logger)
        {
            var path = Path.Combine(contentRoot, "Data", "chatbot_dataset.json");

            if (!File.Exists(path))
            {
                logger.LogWarning("chatbot_dataset.json not found at {Path}.", path);
                return (new List<ChatbotIntent>(), null);
            }

            try
            {
                var json = File.ReadAllText(path);
                using var doc      = JsonDocument.Parse(json, JsonDocOpts);
                var intentsArr     = doc.RootElement.GetProperty("intents");
                var all            = new List<ChatbotIntent>();

                foreach (var el in intentsArr.EnumerateArray())
                {
                    var intent = new ChatbotIntent
                    {
                        Intent              = GetStr(el, "intent"),
                        Group               = GetStr(el, "group"),
                        Scope               = GetStr(el, "scope", "all"),
                        ResponseEn          = GetStr(el, "response_en"),
                        ResponseAr          = GetStr(el, "response_ar"),
                        ResponseJobSeekerEn = GetStr(el, "response_jobseeker_en"),
                        ResponseJobSeekerAr = GetStr(el, "response_jobseeker_ar"),
                        ResponseCompanyEn   = GetStr(el, "response_company_en"),
                        ResponseCompanyAr   = GetStr(el, "response_company_ar"),
                    };

                    if (el.TryGetProperty("patterns", out var pArr))
                        foreach (var p in pArr.EnumerateArray())
                        {
                            var v = p.GetString();
                            if (!string.IsNullOrWhiteSpace(v)) intent.Patterns.Add(v);
                        }

                    if (el.TryGetProperty("keywords", out var kArr))
                        foreach (var k in kArr.EnumerateArray())
                        {
                            var v = k.GetString();
                            if (!string.IsNullOrWhiteSpace(v)) intent.Keywords.Add(v);
                        }

                    all.Add(intent);
                }

                var fallback = all.FirstOrDefault(x => x.Intent == "unknown");
                var main     = all.Where(x => x.Intent != "unknown").ToList();

                logger.LogInformation("chatbot_dataset.json loaded: {Count} intents.", main.Count);
                return (main, fallback);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to load chatbot_dataset.json.");
                return (new List<ChatbotIntent>(), null);
            }
        }

        private static string GetStr(JsonElement el, string prop, string def = "") =>
            el.TryGetProperty(prop, out var v) ? (v.GetString() ?? def) : def;

        // ── Cache key ─────────────────────────────────────────────────────────

        private static string HashMessage(string message)
        {
            var n = Regex.Replace(message.Trim().ToLowerInvariant(), @"\s+", " ");
            return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(n)))[..20];
        }
    }
}
