using System;
namespace aabu_project.Models;

public class Education
{
    public int Id { get; set; }
    public string EducationLevel { get; set; } = null!;
    public string Institution { get; set; } = null!;
    public int GraduationYear { get; set; }
    public int ResumeId { get; set; }

    public Resume Resume { get; set; } = null!;
}