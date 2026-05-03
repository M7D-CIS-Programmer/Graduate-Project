using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace aabu_project.Dtos;

public class ApplicationJobCreateDto
{
    [Required(ErrorMessage = "Job ID is required.")]
    [Range(1, int.MaxValue, ErrorMessage = "Invalid job ID.")]
    public int JobId { get; set; }

    [Required(ErrorMessage = "User ID is required.")]
    [Range(1, int.MaxValue, ErrorMessage = "Invalid user ID.")]
    public int UserId { get; set; }

    [StringLength(2000, ErrorMessage = "Note must not exceed 2000 characters.")]
    public string? Note { get; set; }

    public string? Cv { get; set; }

    public IFormFile? CvFile { get; set; }
}

public class ApplicationStatusUpdateDto
{
    [Required(ErrorMessage = "Status is required.")]
    [StringLength(50, ErrorMessage = "Status value is too long.")]
    public string Status { get; set; } = null!;
}
