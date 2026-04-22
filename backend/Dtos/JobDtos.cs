namespace aabu_project.Dtos;

public class JobCreateDto
{
    public int UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string WorkMode { get; set; } = null!;
    public string Responsibilities { get; set; } = null!;
    public string Requirements { get; set; } = null!;
    public int CategoryId { get; set; }
    public bool IsSalaryNegotiable { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? Features { get; set; }
    public string? Status { get; set; }
    public string? Location { get; set; }
    public string? Company { get; set; }
}

public class JobUpdateDto
{
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string WorkMode { get; set; } = null!;
    public string Responsibilities { get; set; } = null!;
    public string Requirements { get; set; } = null!;
    public string? Location { get; set; }
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
    public int CategoryId { get; set; }
    public bool IsSalaryNegotiable { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? Features { get; set; }
    public string? Status { get; set; }
    public string? Location { get; set; }
    public string? Company { get; set; }
    public DateTime PostedDate { get; set; }

    public int ApplicantsCount { get; set; }
    public UserDto User { get; set; } = null!;
    public CategoryResponseDto Category { get; set; } = null!;
}

