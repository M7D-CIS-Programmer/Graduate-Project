namespace aabu_project.Dtos;

public class SearchResultDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Type { get; set; } = null!; // "Job", "Candidate", "Company", "Page"
    public string Link { get; set; } = null!;
    public string? SearchKey { get; set; }
}

public class SearchResponseDto
{
    public List<SearchResultDto> Jobs { get; set; } = new();
    public List<SearchResultDto> Candidates { get; set; } = new();
    public List<SearchResultDto> Companies { get; set; } = new();
    public List<SearchResultDto> Pages { get; set; } = new();
    public List<SearchResultDto> ContactMessages { get; set; } = new();
}
