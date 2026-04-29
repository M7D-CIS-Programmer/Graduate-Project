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
        u.ProfilePicture
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
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null)
            return Unauthorized(new { message = "Invalid email or password" });

        // Verify password
        bool isValid = _authService.VerifyPassword(dto.Password, user.Pass);
        Console.WriteLine($"[Login Debug] User found: {user.Email}, Password valid: {isValid}");

        if (!isValid)
            return Unauthorized(new { message = "Invalid email or password" });

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
            Role = user.Roles?.FirstOrDefault()?.RoleName ?? "Job Seeker",
            Token = token,
            CreatedAt = user.CreatedAt,
            ProfilePicture = user.ProfilePicture
        };

        return Ok(response);
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Include(u => u.Roles)
            .Include(u => u.Jobs)
            .ToListAsync();
        return Ok(users.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id, [FromQuery] int? viewerId = null)
    {
        var user = await _context.Users
            .Include(u => u.Roles)
            .Include(u => u.Jobs)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound();

        // Notify user if someone else viewed their profile
        if (viewerId.HasValue && viewerId.Value != id)
        {
            var viewer = await _context.Users.FindAsync(viewerId.Value);
            var notification = new Notification
            {
                UserId = id,
                Title = "Profile Viewed",
                Message = $"{(viewer?.Name ?? "Someone")} viewed your profile.",
                Type = "ProfileView",
                IsRead = false
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }

        return Ok(ToDto(user));
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(UserCreateDto dto)
    {
        // Validate input
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Normalize email before storing so lookups are always consistent
        dto.Email = dto.Email.Trim().ToLower();

        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (existingUser != null)
            return BadRequest(new { message = "Email is already registered" });

        // Normalize RoleName for better consistency
        var normalizedRole = dto.RoleName.Trim();
        if (string.Equals(normalizedRole, "Company", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(normalizedRole, "Employer", StringComparison.OrdinalIgnoreCase))
        {
            normalizedRole = "Employer";
        }
        else if (string.Equals(normalizedRole, "Job Seeker", StringComparison.OrdinalIgnoreCase) ||
                 string.Equals(normalizedRole, "JobSeeker", StringComparison.OrdinalIgnoreCase))
        {
            normalizedRole = "Job Seeker";
        }



        // Hash password
        var hashedPassword = _authService.HashPassword(dto.Pass);

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            Pass = hashedPassword,  // Store hashed password
            Location = dto.Location,
            Phone = dto.Phone,
            Status = "Active",
            Industry = dto.Industry,
            SearchKey = aabu_project.Utilities.SearchUtility.GenerateSearchKey(dto.Name, dto.Industry, dto.Location),
            Roles = new List<Role> { new Role { RoleName = normalizedRole } }
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

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
            Role = user.Roles?.FirstOrDefault()?.RoleName ?? "Job Seeker",
            Token = token,
            CreatedAt = user.CreatedAt,
            ProfilePicture = user.ProfilePicture
        };

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, response);
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

        var user = await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Id == id);
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

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] string status)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.Status = status;
        await _context.SaveChangesAsync();
        return Ok(ToDto(user));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return Ok("Deleted");
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