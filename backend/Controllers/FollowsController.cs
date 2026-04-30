using aabu_project.Data;
using aabu_project.Models;
using aabu_project.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace aabu_project.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FollowsController : ControllerBase
{
    private readonly MyDbContext _context;

    public FollowsController(MyDbContext context)
    {
        _context = context;
    }

    // POST: api/follows/{userId}/follow/{companyId}
    [HttpPost("{userId}/follow/{companyId}")]
    public async Task<IActionResult> FollowCompany(int userId, int companyId)
    {
        var callerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(callerIdClaim, out int callerId) || callerId != userId)
            return Forbid();

        var company = await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Id == companyId);
        if (company == null) return NotFound(new { message = "Company not found" });

        var companyRole = company.Roles?.FirstOrDefault()?.RoleName;
        if (companyRole != "Employer" && companyRole != "Company")
            return BadRequest(new { message = "You can only follow companies/employers." });

        var existingFollow = await _context.FollowCompanies
            .FirstOrDefaultAsync(f => f.UserId == userId && f.CompanyId == companyId);

        if (existingFollow != null)
            return BadRequest(new { message = "You are already following this company." });

        var follow = new FollowCompany
        {
            UserId = userId,
            CompanyId = companyId,
            FollowedAt = DateTimeOffset.UtcNow
        };

        _context.FollowCompanies.Add(follow);

        var follower = await _context.Users.FindAsync(userId);
        var notification = new Notification
        {
            UserId = companyId,
            Title = "New Follower",
            Message = $"{follower?.Name ?? "A user"} is now following your company.",
            Type = "Follow",
            IsRead = false,
            Receiver = companyRole,
            RelatedId = userId,
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Company followed successfully." });
    }

    // DELETE: api/follows/{userId}/unfollow/{companyId}
    [HttpDelete("{userId}/unfollow/{companyId}")]
    public async Task<IActionResult> UnfollowCompany(int userId, int companyId)
    {
        var callerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(callerIdClaim, out int callerId) || callerId != userId)
            return Forbid();

        var follow = await _context.FollowCompanies
            .FirstOrDefaultAsync(f => f.UserId == userId && f.CompanyId == companyId);

        if (follow == null)
            return NotFound(new { message = "You are not following this company." });

        _context.FollowCompanies.Remove(follow);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Company unfollowed successfully." });
    }

    // GET: api/follows/{userId}/following
    [HttpGet("{userId}/following")]
    public async Task<IActionResult> GetFollowedCompanies(int userId)
    {
        var callerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(callerIdClaim, out int callerId) || callerId != userId)
            return Forbid();

        var followedCompanies = await _context.FollowCompanies
            .Where(f => f.UserId == userId)
            .Include(f => f.Company)
                .ThenInclude(c => c.Followers)
            .Select(f => new UserDto(
                f.Company.Id,
                f.Company.Name,
                f.Company.Email,
                f.Company.Location,
                f.Company.Website,
                f.Company.Phone,
                f.Company.Description,
                f.Company.LinkedIn,
                f.Company.Github,
                f.Company.Status,
                "Employer",
                f.Company.CreatedAt,
                0,
                f.Company.Industry,
                f.Company.ProfilePicture,
                f.Company.Followers.Count
            ))
            .ToListAsync();

        return Ok(followedCompanies);
    }
}
