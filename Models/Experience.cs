using System;
namespace aabu_project.Models;

public class Experience
{
    public int Id { get; set; }
    public int ResumeId { get; set; }
    public string JobName { get; set; } = null!;
    public string CompanyName { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    // Navigation
    public Resume Resume { get; set; } = null!;
}