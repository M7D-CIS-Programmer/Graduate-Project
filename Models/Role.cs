using System;
namespace aabu_project.Models;

public class Role
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string RoleName { get; set; } = null!;

    public User User { get; set; } = null!;
}