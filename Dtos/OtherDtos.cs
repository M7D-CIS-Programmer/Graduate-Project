namespace aabu_project.Dtos;

public class CategoryCreateDto
{
    public string Name { get; set; } = null!;
}

public class NotificationCreateDto
{
    public int UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string? Type { get; set; }
}
