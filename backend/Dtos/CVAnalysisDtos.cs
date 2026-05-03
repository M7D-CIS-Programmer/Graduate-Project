namespace aabu_project.Dtos
{
    // ── Response returned to the frontend ─────────────────────────────────────
    // Strict advisor format — NO rewritten CV content, ONLY improvement guidance.

    public class CVAnalysisResponseDto
    {
        /// <summary>0-100: how well the CV matches the specific job.</summary>
        public double MatchScore { get; set; }

        /// <summary>Skills required by the job that are absent from the CV.</summary>
        public List<string> MissingSkills { get; set; } = new();

        /// <summary>Specific CV sections identified as weak (e.g. "Experience section lacks measurable achievements").</summary>
        public List<string> WeakSections { get; set; } = new();

        /// <summary>Actionable, advisor-only suggestions — never rewrites.</summary>
        public List<string> ImprovementSuggestions { get; set; } = new();

        /// <summary>Important keywords from the job description missing from the CV.</summary>
        public List<string> KeywordGaps { get; set; } = new();
    }

    // ── Fraud detection types ─────────────────────────────────────────────────

    public class CVFraudIssue
    {
        public string Issue  { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }

    public class CVFraudDetectionResponseDto
    {
        /// <summary>True when one or more suspicious patterns are found.</summary>
        public bool IsSuspicious { get; set; }

        /// <summary>Overall risk level: low | medium | high</summary>
        public string RiskLevel { get; set; } = "low";

        /// <summary>Specific inconsistencies or red flags detected.</summary>
        public List<CVFraudIssue> IssuesFound { get; set; } = [];

        /// <summary>Final verdict: trusted | questionable | likely_fake</summary>
        public string FinalVerdict { get; set; } = "trusted";
    }

    // ── Deep semantic analysis response ───────────────────────────────────────
    // Returned by POST /api/cv/semantic-analyze. Focuses on meaning and logic,
    // not keyword counting (scoring is handled by the hybrid pipeline above).

    public class SemanticCVAnalysisResponseDto
    {
        /// <summary>Narrative explanation of how well the candidate fits the role semantically.</summary>
        public string SemanticMatchAnalysis { get; set; } = string.Empty;

        /// <summary>Areas where the candidate genuinely aligns with the role requirements.</summary>
        public List<string> KeyMatchingAreas { get; set; } = new();

        /// <summary>Critical skills or qualifications absent from the CV that the role requires.</summary>
        public List<string> MissingCriticalSkills { get; set; } = new();

        /// <summary>Assessed quality of work experience descriptions: low | medium | high</summary>
        public string ExperienceQuality { get; set; } = "medium";

        /// <summary>Logical consistency of the CV timeline and claims: pass | warning | fail</summary>
        public string ConsistencyCheck { get; set; } = "pass";

        /// <summary>Suspicious patterns or red flags found in the CV.</summary>
        public List<string> FraudIndicators { get; set; } = new();

        /// <summary>Short professional conclusion on the candidate's suitability.</summary>
        public string OverallInsight { get; set; } = string.Empty;
    }

    // ── Bulk text-based match score (no PDF, no Gemini) ──────────────────────

    public class CvMatchScoreRequestDto
    {
        public string CvText        { get; set; } = string.Empty;
        public string JobTitle      { get; set; } = string.Empty;
        public string JobDescription { get; set; } = string.Empty;
    }

    // ── Hiring recommendation ─────────────────────────────────────────────────

    public class HiringRecommendationRequestDto
    {
        /// <summary>Output from POST /api/cv/semantic-analyze.</summary>
        public SemanticCVAnalysisResponseDto SemanticAnalysis { get; set; } = new();

        /// <summary>Output from POST /api/cv/fraud-check.</summary>
        public CVFraudDetectionResponseDto FraudResult { get; set; } = new();

        /// <summary>Numeric match score (0-100) produced by the local hybrid pipeline.</summary>
        public double MatchScore { get; set; }

        /// <summary>"ar" | "en" — controls language of all AI-generated text in the response.</summary>
        public string? Language { get; set; }
    }

    public class HiringRecommendationResponseDto
    {
        /// <summary>strong_hire | hire | neutral | reject</summary>
        public string FinalDecision { get; set; } = "neutral";

        /// <summary>Composite score 0-100 combining match score and AI signals.</summary>
        public double FinalScore { get; set; }

        /// <summary>Objective explanation combining all three input factors.</summary>
        public string Reasoning { get; set; } = string.Empty;

        /// <summary>low | medium | high — driven primarily by fraud and consistency signals.</summary>
        public string RiskAssessment { get; set; } = "low";

        /// <summary>Actionable next step for the hiring team.</summary>
        public string Recommendation { get; set; } = string.Empty;
    }

    // ── Unified Job Matching Engine ───────────────────────────────────────────────
    // Returned by POST /api/cv/match.
    // One Gemini call processes CV + job description together with semantic understanding.

    public class JobMatchResponseDto
    {
        /// <summary>Semantic match score 0-100.</summary>
        public double MatchScore { get; set; }

        /// <summary>Skills the candidate demonstrably has that the role requires (synonym-aware).</summary>
        public List<string> MatchedSkills { get; set; } = new();

        /// <summary>Skills the role clearly requires that are absent from the CV.</summary>
        public List<string> MissingSkills { get; set; } = new();

        /// <summary>2-3 sentence objective assessment of candidate fit.</summary>
        public string Summary { get; set; } = string.Empty;

        /// <summary>Specific CV sections identified as weak — advisor output.</summary>
        public List<string> WeakSections { get; set; } = new();

        /// <summary>Actionable improvement suggestions — advisor output, never rewrites.</summary>
        public List<string> ImprovementSuggestions { get; set; } = new();

        /// <summary>Important job keywords missing from the CV — from local pre-analysis.</summary>
        public List<string> KeywordGaps { get; set; } = new();
    }
}
