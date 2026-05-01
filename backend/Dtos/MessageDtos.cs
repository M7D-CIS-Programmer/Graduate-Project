namespace aabu_project.Dtos;

public class MessageCreateDto
{
    public int ApplicationJobId { get; set; }
    public int SenderId { get; set; }
    public string Content { get; set; } = null!;
}

public class MessageResponseDto
{
    public int Id { get; set; }
    public int ApplicationJobId { get; set; }
    public int SenderId { get; set; }
    public string SenderName { get; set; } = null!;
    public string? SenderPicture { get; set; }
    public string Content { get; set; } = null!;
    public DateTimeOffset SentAt { get; set; }
    public bool IsRead { get; set; }
}

public class ConversationSummaryDto
{
    public int ApplicationJobId { get; set; }
    public string JobTitle { get; set; } = null!;
    public int CandidateId { get; set; }
    public string CandidateName { get; set; } = null!;
    public string? CandidatePicture { get; set; }
    public int EmployerId { get; set; }
    public string EmployerName { get; set; } = null!;
    public string? EmployerPicture { get; set; }
    public string? LastMessage { get; set; }
    public DateTimeOffset? LastMessageAt { get; set; }
    public int UnreadCount { get; set; }
}
