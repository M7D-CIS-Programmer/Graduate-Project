using System;
namespace aabu_project.Models;

public class Experience
{
    public int Id { get; set; }
    public int ResumeId { get; set; }
    public string JobName { get; set; } = null!;
    public string CompanyName { get; set; } = null!;
    public string StartDate { get; set; } = null!;
    public string? EndDate { get; set; }
    public string? Description { get; set; }

    // Navigation
    public Resume Resume { get; set; } = null!;
}