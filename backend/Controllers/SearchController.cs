using aabu_project.Data;
using aabu_project.Models;
using aabu_project.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace aabu_project.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController(MyDbContext context) : ControllerBase
{
    private readonly MyDbContext _context = context;

    [HttpGet]
    public async Task<IActionResult> GetUnifiedSearch([FromQuery] string q, [FromQuery] string? role = null, [FromQuery] int? userId = null)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new SearchResponseDto());

        var keyword = q.Trim().ToLower();
        var response = new SearchResponseDto();

        // 1. Filter Dynamic Data Based on Role
        if (role == "Employer")
        {
            // Employers see their own jobs
            response.Jobs = await _context.Jobs
                .Where(j => j.UserId == userId && (j.Title.Contains(keyword) || j.Description.Contains(keyword)))
                .Select(j => new SearchResultDto { Id = j.Id, Title = j.Title, Description = j.Status ?? "Active", Type = "Job", Link = $"/jobs/{j.Id}" })
                .Take(5).ToListAsync();

            // Employers see candidates
            response.Candidates = await _context.Users
                .Include(u => u.Roles)
                .Where(u => u.Roles.Any(r => r.RoleName == "Job Seeker") && (u.Name.Contains(keyword) || (u.Industry != null && u.Industry.Contains(keyword))))
                .Select(u => new SearchResultDto { Id = u.Id, Title = u.Name, Description = u.Industry ?? "Professional", Type = "Candidate", Link = $"/profile/{u.Id}" })
                .Take(5).ToListAsync();
        }
        else if (role == "Job Seeker" || string.IsNullOrEmpty(role))
        {
            // Job Seekers and Guests see all active jobs
            response.Jobs = await _context.Jobs
                .Where(j => j.Title.Contains(keyword) || j.Description.Contains(keyword) || (j.Company != null && j.Company.Contains(keyword)))
                .Select(j => new SearchResultDto { Id = j.Id, Title = j.Title, Description = j.Company ?? "Company", Type = "Job", Link = $"/jobs/{j.Id}" })
                .Take(5).ToListAsync();

            // Job Seekers and Guests see companies
            response.Companies = await _context.Users
                .Include(u => u.Roles)
                .Where(u => u.Roles.Any(r => r.RoleName == "Employer" || r.RoleName == "Company") && (u.Name.Contains(keyword) || (u.Industry != null && u.Industry.Contains(keyword))))
                .Select(u => new SearchResultDto { Id = u.Id, Title = u.Name, Description = u.Industry ?? "Company", Type = "Company", Link = $"/profile/{u.Id}" })
                .Take(5).ToListAsync();
        }

        // 2. Define Role-Based Static Pages
        var pagesList = new List<SearchResultDto>();
        
        // Settings/Profile/Notifications are common for all logged-in users
        if (!string.IsNullOrEmpty(role))
        {
            pagesList.Add(new() { Title = "Dashboard", Description = "Overview", Type = "Page", Link = "/dashboard" });
            pagesList.Add(new() { Title = "Profile", Description = "Manage account", Type = "Page", Link = "/profile" });
            pagesList.Add(new() { Title = "Settings", Description = "Account settings", Type = "Page", Link = "/settings" });
            pagesList.Add(new() { Title = "Notifications", Description = "Your alerts", Type = "Page", Link = "/notifications" });
        }
        else
        {
            pagesList.Add(new() { Title = "Settings", Description = "Guest settings", Type = "Page", Link = "/settings" });
        }

        if (string.IsNullOrEmpty(role)) // Guest
        {
            pagesList.Add(new() { Title = "Find Jobs", Description = "Browse all jobs", Type = "Page", Link = "/jobs" });
            pagesList.Add(new() { Title = "Companies", Description = "Browse organizations", Type = "Page", Link = "/companies" });
        }
        else if (role == "Employer")
        {
            pagesList.Add(new() { Title = "My Jobs", Description = "Your postings", Type = "Page", Link = "/my-jobs" });
            pagesList.Add(new() { Title = "Post a Job", Description = "Add new opening", Type = "Page", Link = "/post-job" });
            pagesList.Add(new() { Title = "Candidates", Description = "Find talent", Type = "Page", Link = "/candidates" });
        }
        else if (role == "Job Seeker")
        {
            pagesList.Add(new() { Title = "My Applications", Description = "Track status", Type = "Page", Link = "/my-applications" });
            pagesList.Add(new() { Title = "Saved Jobs", Description = "Your bookmarks", Type = "Page", Link = "/saved-jobs" });
            pagesList.Add(new() { Title = "Resume Builder", Description = "Create CV", Type = "Page", Link = "/resume-builder" });
            pagesList.Add(new() { Title = "Find Jobs", Description = "Browse all jobs", Type = "Page", Link = "/jobs" });
            pagesList.Add(new() { Title = "Companies", Description = "Browse organizations", Type = "Page", Link = "/companies" });
        }

        response.Pages = pagesList
            .Where(p => p.Title.ToLower().Contains(keyword) || p.Description.ToLower().Contains(keyword))
            .ToList();

        return Ok(response);
    }
}
