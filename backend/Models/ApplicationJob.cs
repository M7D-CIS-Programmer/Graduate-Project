namespace aabu_project.Models;
using System;

public class ApplicationJob
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public int UserId { get; set; }
    public DateTime Date { get; set; }
    public string? CandidateStatus { get; set; }
    public string? CompanyStatus { get; set; }
    public string? Note { get; set; }
    public string? Cv { get; set; }

    public Job Job { get; set; } = null!;
    public User User { get; set; } = null!;
}