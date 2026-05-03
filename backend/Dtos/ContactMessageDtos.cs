using System.ComponentModel.DataAnnotations;
namespace aabu_project.Dtos;

public class ContactMessageCreateDto
{
    [Required(ErrorMessage = "Full name is required.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters.")]
    public string FullName { get; set; } = null!;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    [StringLength(254, ErrorMessage = "Email is too long.")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Subject is required.")]
    [StringLength(200, MinimumLength = 3, ErrorMessage = "Subject must be between 3 and 200 characters.")]
    public string Subject { get; set; } = null!;

    [Required(ErrorMessage = "Message is required.")]
    [StringLength(2000, MinimumLength = 10, ErrorMessage = "Message must be between 10 and 2000 characters.")]
    public string Message { get; set; } = null!;

    [StringLength(20, ErrorMessage = "Phone number is too long.")]
    public string? Phone { get; set; }

    public int?    UserId   { get; set; }
    public string? UserRole { get; set; }
}

public class ContactMessageResponseDto
{
    public int             Id        { get; set; }
    public string          FullName  { get; set; } = null!;
    public string          Email     { get; set; } = null!;
    public string          Subject   { get; set; } = null!;
    public string          Message   { get; set; } = null!;
    public string?         Phone     { get; set; }
    public int?            UserId    { get; set; }
    public string?         UserRole  { get; set; }
    public string          Status    { get; set; } = null!;
    public DateTimeOffset  CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}

public class ContactStatusUpdateDto
{
    [Required(ErrorMessage = "Status is required.")]
    public string Status { get; set; } = null!;
}
