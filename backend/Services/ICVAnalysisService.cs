using aabu_project.Dtos;

namespace aabu_project.Services
{
    public interface ICVAnalysisService
    {
        /// <summary>Extract plain text from a PDF stream.</summary>
        string ExtractTextFromPdf(Stream pdfStream);

        /// <summary>Compare CV text against a job posting using Gemini AI.</summary>
        /// <param name="lang">"ar" | "en" — AI response language.</param>
        Task<CVAnalysisResponseDto> AnalyzeCvAsync(
            string cvText, string jobTitle, string jobDescription, string lang = "en");

        /// <summary>Deep semantic analysis with full CV context.</summary>
        /// <param name="lang">"ar" | "en"</param>
        Task<SemanticCVAnalysisResponseDto> SemanticAnalyzeCvAsync(
            string cvText, string jobDescription, string lang = "en");

        /// <summary>Integrity and fraud detection.</summary>
        /// <param name="lang">"ar" | "en"</param>
        Task<CVFraudDetectionResponseDto> DetectCvFraudAsync(string cvText, string lang = "en");

        /// <summary>Senior advisor aggregation: hiring decision.</summary>
        Task<HiringRecommendationResponseDto> GenerateHiringRecommendationAsync(
            HiringRecommendationRequestDto request);

        /// <summary>Fast local-only text matching — no Gemini call.</summary>
        LocalAnalysisResult LocalAnalyzeText(
            string cvText, string jobTitle, string jobDescription);

        /// <summary>Unified Job Matching Engine — single Gemini call.</summary>
        /// <param name="lang">"ar" | "en"</param>
        Task<JobMatchResponseDto> MatchCvToJobAsync(
            string cvText, string jobTitle, string jobDescription, string lang = "en");
    }
}
