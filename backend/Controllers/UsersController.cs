using aabu_project.Data;
using aabu_project.Models;
using aabu_project.Dtos;
using aabu_project.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;


[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly MyDbContext _context;
    private readonly AuthService _authService;

    public UsersController(MyDbContext context, AuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    private static UserDto ToDto(User u) => new(
        u.Id, u.Name, u.Email,
        u.Location, u.Website, u.Phone,
        u.Description, u.LinkedIn, u.Github, u.Status,
        u.Roles?.FirstOrDefault()?.RoleName ?? "Job Seeker",
        u.CreatedAt,
        u.Jobs?.Count(j => j.Status == "Active") ?? 0,
        u.Industry,
        u.ProfilePicture,
        u.Followers?.Count ?? 0
    );

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        // Validate input
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Normalize email before lookup so casing and whitespace never cause mismatches
        var normalizedEmail = dto.Email.Trim().ToLower();

        var user = await _context.Users
            .Include(u => u.Roles)
            .Include(u => u.Followers)
            .Include(u => u.Applications)
                .ThenInclude(a => a.Job)
                    .ThenInclude(j => j.Department)
            .Include(u => u.Applications)
                .ThenInclude(a => a.Job)
                    .ThenInclude(j => j.User)
                        .ThenInclude(u => u.Followers)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null)
            return Unauthorized(new { message = "Invalid email or password" });

        // Verify password
        bool isValid = _authService.VerifyPassword(dto.Password, user.Pass);

        if (!isValid)
            return Unauthorized(new { message = "Invalid email or password" });

        // Block suspended accounts before issuing a token
        if (string.Equals(user.Status, "Suspended", StringComparison.OrdinalIgnoreCase))
            return StatusCode(403, new { error = "ACCOUNT_SUSPENDED",
                message = "Your account has been temporarily suspended by the administrator. Please contact support for assistance." });

        // Generate JWT token
        var token = _authService.GenerateJwtToken(user);

        // Return auth response with token
        var response = new AuthResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Location = user.Location,
            Phone = user.Phone,
            Website = user.Website,
            Description = user.Description,
            LinkedIn = user.LinkedIn,
            Github = user.Github,
            Industry = user.Industry,
            Role = user.Roles?.FirstOrDefault()?.RoleName ?? "Job Seeker",
            Token = token,
            CreatedAt = user.CreatedAt,
            ProfilePicture = user.ProfilePicture,
            FollowerCount = user.Followers?.Count ?? 0,
            AppliedJobs = user.Applications.Select(a => new JobResponseDto
            {
                Id = a.Job.Id,
                UserId = a.Job.UserId,
                Title = a.Job.Title,
                Description = a.Job.Description,
                Type = a.Job.Type,
                WorkMode = a.Job.WorkMode,
                Responsibilities = a.Job.Responsibilities,
                Requirements = a.Job.Requirements,
                DepartmentId = a.Job.DepartmentId,
                IsSalaryNegotiable = a.Job.IsSalaryNegotiable,
                SalaryMin = a.Job.SalaryMin,
                SalaryMax = a.Job.SalaryMax,
                Features = a.Job.Features,
                Status = a.Job.Status,
                Location = a.Job.Location,
                Company = a.Job.Company,
                PostedDate = a.Job.PostedDate,
                User = new UserDto(
                    a.Job.User.Id,
                    a.Job.User.Name,
                    a.Job.User.Email,
                    a.Job.User.Location,
                    a.Job.User.Website,
                    a.Job.User.Phone,
                    a.Job.User.Description,
                    a.Job.User.LinkedIn,
                    a.Job.User.Github,
                    a.Job.User.Status,
                    a.Job.User.Roles.FirstOrDefault()?.RoleName,
                    a.Job.User.CreatedAt,
                    0,
                    a.Job.User.Industry,
                    a.Job.User.ProfilePicture,
                    a.Job.User.Followers?.Count ?? 0
                ),
                Department = new DepartmentResponseDto
                {
                    Id = a.Job.Department.Id,
                    Name = a.Job.Department.Name
                }
            }).ToList()
        };

        return Ok(response);
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Include(u => u.Roles)
            .Include(u => u.Jobs)
            .Include(u => u.Followers)
            .ToListAsync();
        return Ok(users.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id, [FromQuery] int? viewerId = null)
    {
        var user = await _context.Users
            .Include(u => u.Roles)
            .Include(u => u.Jobs)
            .Include(u => u.Followers)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound();

        // Notify user if someone else viewed their profile
        if (viewerId.HasValue && viewerId.Value != id)
        {
            var viewer = await _context.Users.FindAsync(viewerId.Value);
            var userRole = user.Roles?.FirstOrDefault()?.RoleName ?? "Job Seeker";
            var notification = new Notification
            {
                UserId = id,
                Title = "Profile Viewed",
                Message = $"{(viewer?.Name ?? "Someone")} viewed your profile.",
                Type = "ProfileView",
                IsRead = false,
                Receiver = userRole,
                RelatedId = viewerId
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }

        return Ok(ToDto(user));
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(UserCreateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.Register(dto);

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return CreatedAtAction(nameof(GetUser), new { id = result.User!.Id }, result.User);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UserUpdateDto dto)
    {
        if (dto == null) return BadRequest(new { message = "Invalid data" });

        // Security: Ensure the authenticated user is only updating their own profile
        var callerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(callerIdClaim, out int callerId) || callerId != id)
            return Forbid(); // 403 — prevent cross-user updates

        var user = await _context.Users.Include(u => u.Roles).Include(u => u.Followers).FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return NotFound();

        // Security: Job Seekers cannot update Employer/Company profiles
        var callerRoleName = user.Roles?.FirstOrDefault()?.RoleName ?? "Job Seeker";
        if (string.Equals(callerRoleName, "Job Seeker", StringComparison.OrdinalIgnoreCase))
        {
            // Job Seeker trying to update — caller IS the profile, so this is their own profile update
            // This is valid; no block needed here since callerId == id is already enforced above.
        }

        if (!string.IsNullOrEmpty(dto.Name)) user.Name = dto.Name;
        if (!string.IsNullOrEmpty(dto.Email)) user.Email = dto.Email;

        user.Location = dto.Location;
        user.Website = dto.Website;
        user.Phone = dto.Phone;
        user.Description = dto.Description;
        user.LinkedIn = dto.LinkedIn;
        user.Github = dto.Github;
        user.Industry = dto.Industry;
        user.SearchKey = aabu_project.Utilities.SearchUtility.GenerateSearchKey(user.Name, user.Industry, user.Location, user.Description);

        await _context.SaveChangesAsync();
        return Ok(ToDto(user));
    }

    [Authorize]
    [HttpPost("{id}/change-password")]
    public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordDto dto)
    {
        var callerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(callerIdClaim, out int callerId) || callerId != id)
            return Forbid();

        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        // Verify current password
        if (!_authService.VerifyPassword(dto.CurrentPassword, user.Pass))
        {
            return BadRequest(new { message = "Invalid current password" });
        }

        // Hash and update new password
        user.Pass = _authService.HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password updated successfully" });
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] string status)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.Status = status;
        await _context.SaveChangesAsync();
        return Ok(ToDto(user));
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var callerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var callerRoleClaim = User.FindFirstValue(ClaimTypes.Role);

        if (!int.TryParse(callerIdClaim, out int callerId))
            return Unauthorized();

        // Only allow user to delete themselves or an admin to delete anyone
        if (callerId != id && callerRoleClaim != "Admin")
            return Forbid();

        var user = await _context.Users
            .Include(u => u.Roles)
            .Include(u => u.Jobs)
                .ThenInclude(j => j.SavedJobs)
            .Include(u => u.Jobs)
                .ThenInclude(j => j.Applications)
            .Include(u => u.Applications)
            .Include(u => u.SavedJobs)
            .Include(u => u.FollowedCompanies)
            .Include(u => u.Followers)
            .Include(u => u.Notifications)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound();

        // 1. Cleanup Employer-related data if they have jobs
        foreach (var job in user.Jobs)
        {
            if (job.SavedJobs.Any())
                _context.SavedJobs.RemoveRange(job.SavedJobs);
            
            if (job.Applications.Any())
                _context.ApplicationJobs.RemoveRange(job.Applications);
            
            _context.Jobs.Remove(job);
        }

        // 2. Cleanup Candidate-related data
        if (user.Applications.Any())
            _context.ApplicationJobs.RemoveRange(user.Applications);
        
        if (user.SavedJobs.Any())
            _context.SavedJobs.RemoveRange(user.SavedJobs);

        // 3. Cleanup Follows
        if (user.FollowedCompanies.Any())
            _context.FollowCompanies.RemoveRange(user.FollowedCompanies);
        
        if (user.Followers.Any())
            _context.FollowCompanies.RemoveRange(user.Followers);

        // 4. Cleanup Notifications
        if (user.Notifications.Any())
            _context.Notifications.RemoveRange(user.Notifications);

        // 5. Cleanup Roles
        if (user.Roles.Any())
            _context.Roles.RemoveRange(user.Roles);

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Account deleted successfully" });
    }

    [Authorize]
    [HttpPost("{id}/upload-profile-picture")]
    public async Task<IActionResult> UploadProfilePicture(int id, [FromForm] IFormFile image)
    {
        if (image == null || image.Length == 0)
            return BadRequest(new { message = "No image uploaded" });

        var callerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(callerIdClaim, out int callerId) || callerId != id)
            return Forbid();

        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads/profiles");

        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);

        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }

        user.ProfilePicture = "uploads/profiles/" + fileName;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Profile picture uploaded successfully",
            imagePath = user.ProfilePicture
        });
    }
}