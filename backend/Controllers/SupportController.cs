using aabu_project.Dtos;
using aabu_project.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/support")]
public class SupportController : ControllerBase
{
    private readonly ISupportService             _support;
    private readonly ILogger<SupportController>  _logger;

    public SupportController(ISupportService support, ILogger<SupportController> logger)
    {
        _support = support;
        _logger  = logger;
    }

    /// <summary>POST /api/support/chat — AI-powered role-aware platform support chatbot.</summary>
    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] SupportChatRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto?.Message))
            return BadRequest(new { error = "Message cannot be empty." });

        if (dto.Message.Trim().Length > 1000)
            return BadRequest(new { error = "Message is too long (max 1000 characters)." });

        var role = dto.Role?.Trim()     ?? string.Empty;
        var lang = dto.Language?.Trim() ?? "en";

        try
        {
            var result = await _support.ChatAsync(dto.Message, role, lang);
            return Ok(result);
        }
        catch (TimeoutException ex)
        {
            _logger.LogWarning(ex, "Support AI timeout");
            return StatusCode(408, new { error = "AI took too long. Please try again." });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogError(ex, "Gemini auth failure");
            return StatusCode(503, new { error = "AI service unavailable." });
        }
        catch (InvalidOperationException ex) when (ex.Message == "QUOTA_EXCEEDED")
        {
            return StatusCode(429, new { error = "AI quota exceeded. Please try again later." });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Support chat error");
            return StatusCode(422, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected support chat error");
            return StatusCode(500, new { error = "Something went wrong. Please try again." });
        }
    }
}
