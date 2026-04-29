using aabu_project.Dtos;

namespace aabu_project.Services
{
    public interface ICVAnalysisService
    {
        /// <summary>Extract plain text from a PDF stream.</summary>
        string ExtractTextFromPdf(Stream pdfStream);

        /// <summary>Compare CV text against a job posting using Gemini AI.</summary>
        Task<CVAnalysisResponseDto> AnalyzeCvAsync(string cvText, string jobTitle, string jobDescription);

        /// <summary>
        /// Deep semantic analysis: evaluates meaning, logic, consistency, and red flags.
        /// Sends the full CV and job description to Gemini — more thorough than AnalyzeCvAsync.
        /// </summary>
        Task<SemanticCVAnalysisResponseDto> SemanticAnalyzeCvAsync(string cvText, string jobDescription);

        /// <summary>
        /// Integrity and fraud detection: checks for unrealistic claims, timeline
        /// contradictions, impossible career progressions, and fabrication signals.
        /// </summary>
        Task<CVFraudDetectionResponseDto> DetectCvFraudAsync(string cvText);

        /// <summary>
        /// Senior advisor aggregation: combines semantic analysis, fraud result,
        /// and system match score into a single hiring decision and recommendation.
        /// </summary>
        Task<HiringRecommendationResponseDto> GenerateHiringRecommendationAsync(
            HiringRecommendationRequestDto request);
    }
}
