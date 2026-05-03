using System.ComponentModel.DataAnnotations;

namespace aabu_project.Dtos;

public class UserCreateDto
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters.")]
    public string Name { get; set; } = null!;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    [StringLength(254, ErrorMessage = "Email is too long.")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Password is required.")]
    [StringLength(72, MinimumLength = 8, ErrorMessage = "Password must be between 8 and 72 characters.")]
    public string Pass { get; set; } = null!;

    [Phone(ErrorMessage = "Please enter a valid phone number.")]
    [StringLength(20, ErrorMessage = "Phone number is too long.")]
    public string? Phone { get; set; }

    [StringLength(100, ErrorMessage = "Location must not exceed 100 characters.")]
    public string? Location { get; set; }

    [Required(ErrorMessage = "Role is required.")]
    public string RoleName { get; set; } = null!;

    [StringLength(100, ErrorMessage = "Industry must not exceed 100 characters.")]
    public string? Industry { get; set; }

    [Url(ErrorMessage = "Please enter a valid website URL.")]
    [StringLength(500, ErrorMessage = "Website URL is too long.")]
    public string? Website { get; set; }

    [StringLength(1000, ErrorMessage = "Description must not exceed 1000 characters.")]
    public string? Description { get; set; }

    public string? ProfilePicture { get; set; }
}

public class UserUpdateDto
{
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters.")]
    public string? Name { get; set; }

    [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    [StringLength(254, ErrorMessage = "Email is too long.")]
    public string? Email { get; set; }

    [StringLength(100, ErrorMessage = "Location must not exceed 100 characters.")]
    public string? Location { get; set; }

    // [Url] and [Phone] are intentionally omitted here: those attributes reject empty strings,
    // which breaks saves when the user clears an optional field. Format validation is handled
    // on the frontend (validators.js). Only length limits are enforced server-side.
    [StringLength(500, ErrorMessage = "Website URL is too long.")]
    public string? Website { get; set; }

    [StringLength(20, ErrorMessage = "Phone number is too long.")]
    public string? Phone { get; set; }

    [StringLength(1000, ErrorMessage = "Description/Bio must not exceed 1000 characters.")]
    public string? Description { get; set; }

    [StringLength(500, ErrorMessage = "LinkedIn URL is too long.")]
    public string? LinkedIn { get; set; }

    [StringLength(500, ErrorMessage = "GitHub URL is too long.")]
    public string? Github { get; set; }

    [StringLength(100, ErrorMessage = "Industry must not exceed 100 characters.")]
    public string? Industry { get; set; }

    public string? ProfilePicture { get; set; }
}

public record UserDto(
    int Id, string Name, string Email,
    string? Location, string? Website, string? Phone,
    string? Description, string? LinkedIn, string? Github, string? Status,
    string? Role, DateTimeOffset CreatedAt, int ActiveJobsCount = 0,
    string? Industry = null, string? ProfilePicture = null, int FollowerCount = 0
);

public class LoginDto
{
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Password is required.")]
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

public class ChangePasswordDto
{
    [Required(ErrorMessage = "Current password is required.")]
    public string CurrentPassword { get; set; } = null!;

    [Required(ErrorMessage = "New password is required.")]
    [StringLength(72, MinimumLength = 8, ErrorMessage = "New password must be between 8 and 72 characters.")]
    public string NewPassword { get; set; } = null!;
}
