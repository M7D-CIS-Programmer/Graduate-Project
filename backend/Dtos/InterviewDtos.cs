namespace aabu_project.Dtos
{
    // ── Requests ──────────────────────────────────────────────────────────────

    public class StartInterviewDto
    {
        public string  JobTitle       { get; set; } = string.Empty;
        public string  JobDescription { get; set; } = string.Empty;
        /// <summary>"ar" | "en" (default "en")</summary>
        public string? Language       { get; set; }
    }

    public class AnswerInterviewDto
    {
        public string  SessionId { get; set; } = string.Empty;
        public string  Answer    { get; set; } = string.Empty;
        /// <summary>"ar" | "en" — must match the session's language.</summary>
        public string? Language  { get; set; }
    }

    // ── Response ──────────────────────────────────────────────────────────────

    public class InterviewResponseDto
    {
        public string SessionId      { get; set; } = string.Empty;
        public int    QuestionNumber { get; set; }
        public int    TotalQuestions { get; set; }
        public bool   IsComplete     { get; set; }

        // Present during the interview (null when IsComplete = true)
        public string? Question { get; set; }

        // Present after each answer (null after start)
        public string? Feedback     { get; set; }
        public double? AnswerScore  { get; set; }   // 0-10 per question

        // Present only when IsComplete = true
        public double?        FinalScore   { get; set; }   // 0-100
        public string?        FinalSummary { get; set; }
        public List<string>?  Strengths    { get; set; }
        public List<string>?  Improvements { get; set; }
        public List<QuestionSummaryDto>? History { get; set; }
    }

    // ── Internal session record (stored in IMemoryCache) ──────────────────────

    public class QuestionSummaryDto
    {
        public string Question { get; set; } = string.Empty;
        public string Answer   { get; set; } = string.Empty;
        public string Feedback { get; set; } = string.Empty;
        public double Score    { get; set; }
    }
}
