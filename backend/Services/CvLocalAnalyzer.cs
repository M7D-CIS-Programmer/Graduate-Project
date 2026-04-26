using System.Text.Json;
using System.Text.RegularExpressions;

namespace aabu_project.Services
{
    /// <summary>
    /// Result produced entirely by local logic — no Gemini tokens consumed.
    /// </summary>
    public sealed class LocalAnalysisResult
    {
        public double Score           { get; set; }
        public double MatchPercentage { get; set; }
        public List<string> MatchedSkills  { get; set; } = new();
        public List<string> MissingSkills  { get; set; } = new();
        public List<string> KeywordMatch   { get; set; } = new();
        public List<string> KeywordMissing { get; set; } = new();
    }

    /// <summary>
    /// Singleton service. Loads job_roles.json once and provides all local
    /// CV-vs-Job analysis: skill extraction, scoring, keyword matching.
    /// </summary>
    public sealed class CvLocalAnalyzer
    {
        private readonly ILogger<CvLocalAnalyzer> _logger;

        // Canonical skill list loaded from job_roles.json
        private readonly List<string> _allSkills;

        // ── Stop-word list (kept short; only the most common words) ──────────────
        private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
        {
            "the","a","an","and","or","but","in","on","at","to","for","of","with","is","are",
            "was","were","be","been","have","has","had","do","does","did","will","would","shall",
            "should","may","might","must","can","could","this","that","these","those","i","you",
            "he","she","it","we","they","not","no","so","then","there","as","if","while","since",
            "work","working","years","year","position","team","strong","good","able","your","our",
            "also","include","including","use","using","used","well","new","please","need","needs",
            "required","preferred","plus","etc","eg","ie","experience","skills","knowledge","ability"
        };

        // ── CV section headers used for structure scoring ─────────────────────────
        private static readonly string[] SectionHeaders =
        {
            "education", "experience", "skills", "summary", "objective", "profile",
            "projects", "certifications", "awards", "achievements", "languages",
            "work history", "employment", "technical", "publications"
        };

        public CvLocalAnalyzer(IWebHostEnvironment env, ILogger<CvLocalAnalyzer> logger)
        {
            _logger = logger;

            var filePath = Path.Combine(env.ContentRootPath, "Data", "job_roles.json");
            _allSkills = LoadSkills(filePath);

            _logger.LogInformation(
                "CvLocalAnalyzer initialised with {Count} known skills from {File}.",
                _allSkills.Count, filePath);
        }

        // ── Public API ────────────────────────────────────────────────────────────

        public LocalAnalysisResult Analyze(string cvText, string jobTitle, string jobDescription)
        {
            var cvNorm  = cvText.ToLowerInvariant();
            var jobNorm = jobDescription.ToLowerInvariant();

            // 1. Extract skills present in CV and in job description
            var cvSkills  = FindSkills(cvNorm);
            var jobSkills = FindSkills(jobNorm);

            // 2. If the job description contains no known skills, fall back to keyword extraction
            if (jobSkills.Count == 0)
                jobSkills = ExtractKeywords(jobNorm).Take(20).ToList();

            // 3. Skill intersection / gap
            var matchedSkills = cvSkills.Intersect(jobSkills, StringComparer.OrdinalIgnoreCase)
                                        .Take(10).ToList();
            var missingSkills = jobSkills.Except(cvSkills, StringComparer.OrdinalIgnoreCase)
                                         .Take(8).ToList();

            // 4. Keyword analysis (broader than skills)
            var cvKeywords  = ExtractKeywords(cvNorm);
            var jobKeywords = ExtractKeywords(jobNorm);
            var keywordMatch   = jobKeywords.Intersect(cvKeywords, StringComparer.OrdinalIgnoreCase)
                                            .Take(8).ToList();
            var keywordMissing = jobKeywords.Except(cvKeywords, StringComparer.OrdinalIgnoreCase)
                                            .Take(8).ToList();

            // 5. Local score
            var score      = CalculateScore(cvText, cvSkills, jobSkills, jobKeywords, cvKeywords);
            var matchPct   = jobSkills.Count > 0
                ? Math.Min(100.0, matchedSkills.Count * 100.0 / jobSkills.Count)
                : Math.Min(100.0, keywordMatch.Count * 100.0 / Math.Max(1, jobKeywords.Count));

            _logger.LogInformation(
                "Local analysis: score={Score}, match={Match}%, cvSkills={Cv}, jobSkills={Job}, matched={Matched}",
                Math.Round(score), Math.Round(matchPct),
                cvSkills.Count, jobSkills.Count, matchedSkills.Count);

            return new LocalAnalysisResult
            {
                Score           = Math.Round(score),
                MatchPercentage = Math.Round(matchPct),
                MatchedSkills   = matchedSkills,
                MissingSkills   = missingSkills,
                KeywordMatch    = keywordMatch,
                KeywordMissing  = keywordMissing
            };
        }

        // ── Skill extraction ──────────────────────────────────────────────────────

        private List<string> FindSkills(string normalizedText)
        {
            var found = new List<string>();
            foreach (var skill in _allSkills)
            {
                if (SkillPresentIn(normalizedText, skill.ToLowerInvariant()))
                    found.Add(skill);
            }
            return found;
        }

        private static bool SkillPresentIn(string text, string skill)
        {
            // Build a pattern that requires a non-alphanumeric boundary on both sides
            // so "java" doesn't match inside "javascript"
            var escaped = Regex.Escape(skill);
            var pattern = $@"(?<![a-z0-9#\+]){escaped}(?![a-z0-9#\+])";
            return Regex.IsMatch(text, pattern);
        }

        // ── Keyword extraction (non-stop words of length ≥ 3) ────────────────────

        private static List<string> ExtractKeywords(string text)
        {
            return Regex.Split(text, @"[^a-z0-9#+\.]+")
                        .Where(w => w.Length >= 3 && !StopWords.Contains(w))
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .ToList();
        }

        // ── Scoring ───────────────────────────────────────────────────────────────

        private static double CalculateScore(
            string cvText,
            List<string> cvSkills,
            List<string> jobSkills,
            List<string> jobKeywords,
            List<string> cvKeywords)
        {
            double score = 0;

            // — Skills match 40% ──────────────────────────────────────────────────
            if (jobSkills.Count > 0)
            {
                var matched = cvSkills.Intersect(jobSkills, StringComparer.OrdinalIgnoreCase).Count();
                score += Math.Min(40, matched * 40.0 / jobSkills.Count);
            }
            else
            {
                score += 20; // neutral when no known skills in job description
            }

            // — Experience 30% ────────────────────────────────────────────────────
            score += DetectExperienceScore(cvText) * 30;

            // — Structure 20% ─────────────────────────────────────────────────────
            score += DetectStructureScore(cvText) * 20;

            // — Keyword coverage 10% ──────────────────────────────────────────────
            if (jobKeywords.Count > 0)
            {
                var overlap = cvKeywords.Intersect(jobKeywords, StringComparer.OrdinalIgnoreCase).Count();
                score += Math.Min(10, overlap * 10.0 / jobKeywords.Count);
            }
            else
            {
                score += 5;
            }

            return Math.Min(100, score);
        }

        // Returns 0.0–1.0 representing detected experience level
        private static double DetectExperienceScore(string cvText)
        {
            var lower = cvText.ToLowerInvariant();

            // Explicit "X years" mentions
            var yearsMatches = Regex.Matches(lower, @"(\d+)\s*\+?\s*years?");
            if (yearsMatches.Count > 0)
            {
                var max = yearsMatches.Max(m => int.TryParse(m.Groups[1].Value, out var y) ? y : 0);
                if (max >= 7) return 1.0;
                if (max >= 5) return 0.9;
                if (max >= 3) return 0.75;
                if (max >= 1) return 0.55;
            }

            // Date ranges (e.g. "2020 - 2023", "Jan 2019 – Present")
            var ranges = Regex.Matches(lower, @"\d{4}\s*[-–]\s*(\d{4}|present|current|now)");
            if (ranges.Count >= 3) return 0.85;
            if (ranges.Count == 2) return 0.70;
            if (ranges.Count == 1) return 0.50;

            // Seniority keywords
            if (Regex.IsMatch(lower, @"\b(senior|lead|principal|architect|head of|director)\b"))
                return 0.80;
            if (Regex.IsMatch(lower, @"\b(mid|middle|intermediate|associate)\b"))
                return 0.55;
            if (Regex.IsMatch(lower, @"\b(junior|entry|graduate|intern|trainee)\b"))
                return 0.35;

            return 0.30; // no experience signals found
        }

        // Returns 0.0–1.0 based on how many recognisable CV sections are present
        private static double DetectStructureScore(string cvText)
        {
            var lower = cvText.ToLowerInvariant();
            var found = SectionHeaders.Count(s => lower.Contains(s));
            return Math.Min(1.0, found / 4.0); // 4+ sections → full score
        }

        // ── Dataset loading ───────────────────────────────────────────────────────

        private List<string> LoadSkills(string filePath)
        {
            try
            {
                if (!File.Exists(filePath))
                {
                    _logger.LogWarning("job_roles.json not found at {Path}; using built-in defaults.", filePath);
                    return GetBuiltInSkills();
                }

                var json = File.ReadAllText(filePath);
                var db   = JsonSerializer.Deserialize<Dictionary<string, List<string>>>(json);

                if (db is null || db.Count == 0)
                    return GetBuiltInSkills();

                return db.Values
                         .SelectMany(v => v)
                         .Distinct(StringComparer.OrdinalIgnoreCase)
                         .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load job_roles.json; using built-in defaults.");
                return GetBuiltInSkills();
            }
        }

        // Minimal hard-coded fallback so the service never crashes without the file
        private static List<string> GetBuiltInSkills() =>
        [
            "C#", "ASP.NET", ".NET", "Java", "Python", "Node.js", "PHP", "Go",
            "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis",
            "HTML", "CSS", "JavaScript", "TypeScript", "React", "Vue", "Angular",
            "Docker", "Kubernetes", "AWS", "Azure", "Git", "Linux",
            "REST", "API", "GraphQL", "Microservices", "OOP", "SOLID",
            "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
            "Agile", "Scrum", "CI/CD"
        ];
    }
}
