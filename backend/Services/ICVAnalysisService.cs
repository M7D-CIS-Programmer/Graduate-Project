using aabu_project.Dtos;

namespace aabu_project.Services
{
    public interface ICVAnalysisService
    {
        /// <summary>Extract plain text from a PDF stream.</summary>
        string ExtractTextFromPdf(Stream pdfStream);

        /// <summary>Compare CV text against a job posting using Gemini AI.</summary>
        Task<CVAnalysisResponseDto> AnalyzeCvAsync(string cvText, string jobTitle, string jobDescription);
    }
}
