namespace aabu_project.Dtos;

public class CategoryCreateDto
{
    public string Name { get; set; } = null!;
}

public class CategoryResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int JobCount { get; set; }
}

public class NotificationCreateDto
{
    public int UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string? Type { get; set; }
}

public class StatsDto
{
    public int ActiveJobs { get; set; }
    public int SuccessStories { get; set; }
    public int VerifiedCompanies { get; set; }
}
