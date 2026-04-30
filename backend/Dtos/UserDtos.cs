using System.ComponentModel.DataAnnotations;

namespace aabu_project.Dtos;

public class UserCreateDto
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
    public string Name { get; set; } = null!;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Password is required")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters")]
    public string Pass { get; set; } = null!;

    public string? Location { get; set; }
    public string? Phone { get; set; }

    [Required(ErrorMessage = "Role is required")]
    public string RoleName { get; set; } = null!;

    public string? Industry { get; set; }
    public string? ProfilePicture { get; set; }

}

public class UserUpdateDto
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Location { get; set; }
    public string? Website { get; set; }
    public string? Phone { get; set; }
    public string? Description { get; set; }
    public string? LinkedIn { get; set; }
    public string? Github { get; set; }
    public string? Industry { get; set; }
    public string? ProfilePicture { get; set; } // For potential later use
}

public record UserDto(
    int Id, string Name, string Email,
    string? Location, string? Website, string? Phone,
    string? Description, string? LinkedIn, string? Github, string? Status,
    string? Role, DateTimeOffset CreatedAt, int ActiveJobsCount = 0, string? Industry = null, string? ProfilePicture = null, int FollowerCount = 0
);

public class LoginDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = null!;
}

public class AuthResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Location { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? Description { get; set; }
    public string? LinkedIn { get; set; }
    public string? Github { get; set; }
    public string? Industry { get; set; }
    public string? Role { get; set; }
    public string Token { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; }
    public string? ProfilePicture { get; set; }
    public int FollowerCount { get; set; }
    public List<JobResponseDto>? AppliedJobs { get; set; }
}

public class AuthResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = null!;
    public AuthResponseDto? User { get; set; }
    public string? Token { get; set; }
}

