using System.ComponentModel.DataAnnotations;
namespace aabu_project.Dtos;

public class DepartmentCreateDto
{
    [Required(ErrorMessage = "Department name is required.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Department name must be between 2 and 100 characters.")]
    public string Name { get; set; } = null!;
}

public class DepartmentUpdateDto
{
    [Required(ErrorMessage = "Department name is required.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Department name must be between 2 and 100 characters.")]
    public string Name { get; set; } = null!;
}

public class DepartmentResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int JobCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class NotificationCreateDto
{
    [Required]
    [Range(1, int.MaxValue)]
    public int UserId { get; set; }

    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, ErrorMessage = "Title must not exceed 200 characters.")]
    public string Title { get; set; } = null!;

    [Required(ErrorMessage = "Message is required.")]
    [StringLength(1000, ErrorMessage = "Message must not exceed 1000 characters.")]
    public string Message { get; set; } = null!;

    [StringLength(50)]
    public string? Type { get; set; }
}
