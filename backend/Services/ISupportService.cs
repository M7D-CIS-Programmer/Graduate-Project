using aabu_project.Dtos;

namespace aabu_project.Services
{
    public interface ISupportService
    {
        /// <param name="message">Raw user message.</param>
        /// <param name="role">Normalised caller role: "jobseeker" | "company" | "" (guest).</param>
        /// <param name="lang">Response language: "ar" | "en" (default "en").</param>
        Task<SupportChatResponseDto> ChatAsync(string message, string role, string lang);
    }
}
