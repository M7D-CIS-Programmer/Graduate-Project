namespace aabu_project.Dtos
{
    public class SupportChatRequestDto
    {
        public string  Message  { get; set; } = string.Empty;
        public int?    UserId   { get; set; }
        /// <summary>Normalised caller role: "jobseeker" | "company" | "" (guest)</summary>
        public string? Role     { get; set; }
        /// <summary>"ar" | "en" — controls language of the AI response.</summary>
        public string? Language { get; set; }
    }

    public class SupportChatResponseDto
    {
        public string  Reply   { get; set; } = string.Empty;
        public bool    Cached  { get; set; }
        /// <summary>Matched intent name — useful for debugging / analytics.</summary>
        public string? Intent  { get; set; }
    }
}
