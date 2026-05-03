namespace aabu_project.Models;

public class ContactMessage
{
    public int             Id        { get; set; }
    public string          FullName  { get; set; } = null!;
    public string          Email     { get; set; } = null!;
    public string          Subject   { get; set; } = null!;
    public string          Message   { get; set; } = null!;
    public string?         Phone     { get; set; }
    public int?            UserId    { get; set; }
    public string?         UserRole  { get; set; }
    /// <summary>New | InProgress | Resolved | Closed</summary>
    public string          Status    { get; set; } = "New";
    public DateTimeOffset  CreatedAt { get; set; } = DateTimeOffset.Now;
    public DateTimeOffset? UpdatedAt { get; set; }
}
