using aabu_project.Dtos;

namespace aabu_project.Services
{
    public interface IInterviewService
    {
        /// <param name="jobTitle">Position being interviewed for.</param>
        /// <param name="jobDescription">Full job description text.</param>
        /// <param name="lang">Response language: "ar" | "en" (default "en").</param>
        Task<InterviewResponseDto> StartAsync(string jobTitle, string jobDescription, string lang);

        /// <param name="sessionId">Active session token.</param>
        /// <param name="answer">Candidate's answer text.</param>
        /// <param name="lang">Response language — must match the session language.</param>
        Task<InterviewResponseDto> AnswerAsync(string sessionId, string answer, string lang);
    }
}
