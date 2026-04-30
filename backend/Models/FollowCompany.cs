using System;

namespace aabu_project.Models;

public class FollowCompany
{
    public int Id { get; set; }
    
    // The Job Seeker
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    // The Employer/Company
    public int CompanyId { get; set; }
    public User Company { get; set; } = null!;

    public DateTimeOffset FollowedAt { get; set; } = DateTimeOffset.UtcNow;
}
