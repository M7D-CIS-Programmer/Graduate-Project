using aabu_project.Dtos;

namespace aabu_project.Services
{
    public interface ISupportService
    {
        Task<SupportChatResponseDto> ChatAsync(string message);
    }
}
