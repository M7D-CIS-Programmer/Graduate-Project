using System;
namespace aabu_project.Models;

public class SavedJob
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int JobId { get; set; }
    public DateTimeOffset SavedAt { get; set; } = DateTimeOffset.UtcNow;

    public User User { get; set; } = null!;
    public Job Job { get; set; } = null!;
}
