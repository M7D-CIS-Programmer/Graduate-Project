using System;
namespace aabu_project.Models;

public class Notification
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string? Type { get; set; }
    public bool IsRead { get; set; }
    public string? Receiver { get; set; }
    public int? RelatedId { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.Now;

    public User User { get; set; } = null!;
}