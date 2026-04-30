using System;

namespace aabu_project.Dtos;

public class ResumeCreateDto
{
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Location { get; set; }
    public string? Bio { get; set; }
    public List<ExperienceCreateDto> Experiences { get; set; } = new();
    public List<EducationCreateDto> Educations { get; set; } = new();
    public List<SkillCreateDto> Skills { get; set; } = new();
}

public class ExperienceCreateDto
{
    public int ResumeId { get; set; }
    public string JobName { get; set; } = null!;
    public string CompanyName { get; set; } = null!;
    public string StartDate { get; set; } = null!;
    public string? EndDate { get; set; }
}

public class EducationCreateDto
{
    public int ResumeId { get; set; }
    public string EducationLevel { get; set; } = null!;
    public string Institution { get; set; } = null!;
    public int GraduationYear { get; set; }
}

public class SkillCreateDto
{
    public int ResumeId { get; set; }
    public string Name { get; set; } = null!;
}

// View DTOs
public class ResumeViewDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Location { get; set; }
    public string? Bio { get; set; }
    public List<ExperienceViewDto> Experiences { get; set; } = new();
    public List<EducationViewDto> Educations { get; set; } = new();
    public List<SkillViewDto> Skills { get; set; } = new();
}

public class ExperienceViewDto
{
    public int Id { get; set; }
    public string JobName { get; set; } = null!;
    public string CompanyName { get; set; } = null!;
    public string StartDate { get; set; } = null!;
    public string? EndDate { get; set; }
}

public class EducationViewDto
{
    public int Id { get; set; }
    public string EducationLevel { get; set; } = null!;
    public string Institution { get; set; } = null!;
    public int GraduationYear { get; set; }
}

public class SkillViewDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
}
