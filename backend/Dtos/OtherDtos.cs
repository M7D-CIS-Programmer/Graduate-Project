namespace aabu_project.Dtos;

public class DepartmentCreateDto
{
    public string Name { get; set; } = null!;
}

public class DepartmentUpdateDto
{
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
    public int UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string? Type { get; set; }
}
