using aabu_project.Dtos;

namespace aabu_project.Services
{
    public interface IInterviewService
    {
        Task<InterviewResponseDto> StartAsync(string jobTitle, string jobDescription);
        Task<InterviewResponseDto> AnswerAsync(string sessionId, string answer);
    }
}
