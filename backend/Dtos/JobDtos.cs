using System.ComponentModel.DataAnnotations;
namespace aabu_project.Dtos;

public class JobCreateDto
{
    [Required]
    public int UserId { get; set; }

    [Required(ErrorMessage = "Job title is required.")]
    [StringLength(120, MinimumLength = 2, ErrorMessage = "Job title must be between 2 and 120 characters.")]
    public string Title { get; set; } = null!;

    [Required(ErrorMessage = "Job description is required.")]
    [StringLength(5000, MinimumLength = 30, ErrorMessage = "Description must be between 30 and 5000 characters.")]
    public string Description { get; set; } = null!;

    [Required(ErrorMessage = "Job type is required.")]
    public string Type { get; set; } = null!;

    [Required(ErrorMessage = "Work mode is required.")]
    public string WorkMode { get; set; } = null!;

    [StringLength(3000, ErrorMessage = "Responsibilities must not exceed 3000 characters.")]
    public string Responsibilities { get; set; } = null!;

    [StringLength(3000, ErrorMessage = "Requirements must not exceed 3000 characters.")]
    public string Requirements { get; set; } = null!;

    [Range(1, int.MaxValue, ErrorMessage = "Please select a valid department.")]
    public int DepartmentId { get; set; }

    public bool IsSalaryNegotiable { get; set; }

    [Range(0, 1_000_000, ErrorMessage = "Minimum salary must be between 0 and 1,000,000.")]
    public decimal? SalaryMin { get; set; }

    [Range(0, 1_000_000, ErrorMessage = "Maximum salary must be between 0 and 1,000,000.")]
    public decimal? SalaryMax { get; set; }

    [StringLength(2000, ErrorMessage = "Benefits must not exceed 2000 characters.")]
    public string? Features { get; set; }

    public string? Status { get; set; }

    [StringLength(100, ErrorMessage = "Location must not exceed 100 characters.")]
    public string? Location { get; set; }

    [StringLength(100, ErrorMessage = "Company name must not exceed 100 characters.")]
    public string? Company { get; set; }
}

public record SavedJobDto(
    int Id,
    int JobId,
    string Title,
    string? Company,
    string? Location,
    string Type,
    string WorkMode,
    decimal? SalaryMin,
    decimal? SalaryMax,
    bool IsSalaryNegotiable,
    string? Status,
    string? Department,
    DateTimeOffset SavedAt
);

public class JobUpdateDto
{
    [Required(ErrorMessage = "Job title is required.")]
    [StringLength(120, MinimumLength = 2, ErrorMessage = "Job title must be between 2 and 120 characters.")]
    public string Title { get; set; } = null!;

    [Required(ErrorMessage = "Job description is required.")]
    [StringLength(5000, MinimumLength = 30, ErrorMessage = "Description must be between 30 and 5000 characters.")]
    public string Description { get; set; } = null!;

    [Required(ErrorMessage = "Job type is required.")]
    public string Type { get; set; } = null!;

    [Required(ErrorMessage = "Work mode is required.")]
    public string WorkMode { get; set; } = null!;

    [StringLength(3000, ErrorMessage = "Responsibilities must not exceed 3000 characters.")]
    public string Responsibilities { get; set; } = null!;

    [StringLength(3000, ErrorMessage = "Requirements must not exceed 3000 characters.")]
    public string Requirements { get; set; } = null!;

    [Range(1, int.MaxValue, ErrorMessage = "Please select a valid department.")]
    public int DepartmentId { get; set; }

    [Range(0, 1_000_000, ErrorMessage = "Minimum salary must be between 0 and 1,000,000.")]
    public decimal? SalaryMin { get; set; }

    [Range(0, 1_000_000, ErrorMessage = "Maximum salary must be between 0 and 1,000,000.")]
    public decimal? SalaryMax { get; set; }

    public bool IsSalaryNegotiable { get; set; }

    [StringLength(2000, ErrorMessage = "Benefits must not exceed 2000 characters.")]
    public string? Features { get; set; }

    [StringLength(100, ErrorMessage = "Location must not exceed 100 characters.")]
    public string? Location { get; set; }

    [StringLength(100, ErrorMessage = "Company name must not exceed 100 characters.")]
    public string? Company { get; set; }
}

public class JobResponseDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string WorkMode { get; set; } = null!;
    public string Responsibilities { get; set; } = null!;
    public string Requirements { get; set; } = null!;
    public int DepartmentId { get; set; }
    public bool IsSalaryNegotiable { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? Features { get; set; }
    public string? Status { get; set; }
    public string? Location { get; set; }
    public string? Company { get; set; }
    public DateTimeOffset PostedDate { get; set; }
    public int ViewsCount { get; set; }
    public int ApplicantsCount { get; set; }
    public UserDto User { get; set; } = null!;
    public DepartmentResponseDto Department { get; set; } = null!;
}
