using System;
using System.Collections.Generic;
using System.Data;
namespace aabu_project.Models;

public class User
{
    public int Id { get; set; }
    //public int RoleId { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Pass { get; set; } = null!;
    public string? Location { get; set; }
    public string? Website { get; set; }
    public string? Phone { get; set; }
    public string? Description { get; set; }
    public string? LinkedIn { get; set; }
    public string? Github { get; set; }
    public string? Status { get; set; }
    public string? Industry { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.Now;

    // Navigation properties
    public ICollection<Resume> Resumes { get; set; } = new List<Resume>();
    public ICollection<Job> Jobs { get; set; } = new List<Job>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<ApplicationJob> Applications { get; set; } = new List<ApplicationJob>();
    public ICollection<Role> Roles { get; set; } = new List<Role>();
}
