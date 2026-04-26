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
}
