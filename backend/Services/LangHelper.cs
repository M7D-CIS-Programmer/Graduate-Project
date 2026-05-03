namespace aabu_project.Services
{
    /// <summary>
    /// Central utility for multilingual AI prompt enforcement.
    /// Every Gemini prompt in the platform must include the result of
    /// <see cref="GetInstruction"/> so the model never mixes languages.
    /// </summary>
    public static class LangHelper
    {
        /// <summary>Normalise any incoming language tag to "ar" or "en" (default "en").</summary>
        public static string Normalize(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return "en";
            return raw.Trim().ToLowerInvariant() switch
            {
                "ar" or "arabic" or "عربي" or "عربى" => "ar",
                _ => "en"
            };
        }

        /// <summary>
        /// Returns the language enforcement block to prepend to every Gemini prompt.
        /// JSON keys MUST stay in English (they are parsed by code).
        /// Only string VALUES should be in the target language.
        /// </summary>
        public static string GetInstruction(string lang) => lang == "ar"
            ? """
              ════════════════════════════════════════
              LANGUAGE RULE — HIGHEST PRIORITY:
              You MUST write ALL text values exclusively in Modern Standard Arabic (اللغة العربية الفصحى).
              Rules:
              • Every word in string fields must be in Arabic.
              • JSON keys remain in English (they are parsed by code — do NOT translate keys).
              • Use formal, professional Arabic. NO dialects. NO slang.
              • Do NOT mix English words into Arabic sentences.
              • The ONLY exception: internationally accepted technical terms with no Arabic equivalent
                (e.g. JavaScript, API, PDF, Docker, SQL, React) — these may appear in Arabic text as-is.
              • Proper Arabic punctuation and grammar are required.
              ════════════════════════════════════════
              """
            : """
              ════════════════════════════════════════
              LANGUAGE RULE — HIGHEST PRIORITY:
              You MUST write ALL text values exclusively in English.
              Rules:
              • Every word in string fields must be in English.
              • JSON keys remain in English.
              • Do NOT write any Arabic text.
              • Use clear, professional English.
              ════════════════════════════════════════
              """;

        /// <summary>Inline variant — use inside interpolated strings.</summary>
        public static string Inline(string lang) => lang == "ar"
            ? "LANGUAGE: Respond in Modern Standard Arabic (فصحى) only. No English in values. No dialects."
            : "LANGUAGE: Respond in English only. No Arabic text.";
    }
}
