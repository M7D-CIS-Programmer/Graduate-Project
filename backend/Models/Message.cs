using System;
namespace aabu_project.Models;

public class Message
{
    public int Id { get; set; }
    public int ApplicationJobId { get; set; }
    public int SenderId { get; set; }
    public string Content { get; set; } = null!;
    public DateTimeOffset SentAt { get; set; } = DateTimeOffset.Now;
    public bool IsRead { get; set; } = false;

    public ApplicationJob ApplicationJob { get; set; } = null!;
    public User Sender { get; set; } = null!;
}
