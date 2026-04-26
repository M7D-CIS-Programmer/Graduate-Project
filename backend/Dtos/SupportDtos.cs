namespace aabu_project.Dtos
{
    public class SupportChatRequestDto
    {
        public string Message { get; set; } = string.Empty;
        public int?   UserId  { get; set; }   // optional, for future per-user history
    }

    public class SupportChatResponseDto
    {
        public string Reply { get; set; } = string.Empty;
        public bool   Cached { get; set; }  // true when response came from cache
    }
}
