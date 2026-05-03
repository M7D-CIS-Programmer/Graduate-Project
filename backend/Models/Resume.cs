using System;
using System.Collections.Generic;
namespace aabu_project.Models;

public class Resume
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Location { get; set; }
    public string? Bio { get; set; }
    public string? LinkedIn { get; set; }
    public string? GitHub { get; set; }
    public string? Website { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<Experience> Experiences { get; set; } = new List<Experience>();
    public ICollection<Skill> Skills { get; set; } = new List<Skill>();
    public ICollection<Education> Educations { get; set; } = new List<Education>();
}