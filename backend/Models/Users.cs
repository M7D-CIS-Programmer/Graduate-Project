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
    public string? SearchKey { get; set; }
    public string? ProfilePicture { get; set; }

    // Navigation properties
    public ICollection<Resume> Resumes { get; set; } = new List<Resume>();
    public ICollection<Job> Jobs { get; set; } = new List<Job>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<ApplicationJob> Applications { get; set; } = new List<ApplicationJob>();
    public ICollection<Role> Roles { get; set; } = new List<Role>();
    public ICollection<SavedJob> SavedJobs { get; set; } = new List<SavedJob>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();

    // Navigation properties for following companies
    public ICollection<FollowCompany> FollowedCompanies { get; set; } = new List<FollowCompany>();
    public ICollection<FollowCompany> Followers { get; set; } = new List<FollowCompany>();
}
