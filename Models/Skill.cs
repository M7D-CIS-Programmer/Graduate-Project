using System;
namespace aabu_project.Models;

public class Skill
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int ResumeId { get; set; }

    public Resume Resume { get; set; } = null!;
}