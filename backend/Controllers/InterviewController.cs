using aabu_project.Dtos;
using aabu_project.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/interview")]
public class InterviewController : ControllerBase
{
    private readonly IInterviewService _service;
    private readonly ILogger<InterviewController> _logger;

    public InterviewController(IInterviewService service, ILogger<InterviewController> logger)
    {
        _service = service;
        _logger  = logger;
    }

    /// <summary>POST /api/interview/start — Begin a new interview session.</summary>
    [HttpPost("start")]
    public async Task<IActionResult> Start([FromBody] StartInterviewDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto?.JobTitle))
            return BadRequest(new { error = "Job title is required." });

        if (string.IsNullOrWhiteSpace(dto.JobDescription) || dto.JobDescription.Trim().Length < 20)
            return BadRequest(new { error = "Job description is required (at least 20 characters)." });

        try
        {
            var result = await _service.StartAsync(
                dto.JobTitle.Trim(), dto.JobDescription.Trim(), dto.Language ?? "en");
            return Ok(result);
        }
        catch (TimeoutException ex)
        {
            _logger.LogWarning(ex, "Gemini timeout on interview start");
            return StatusCode(408, new { error = "AI took too long to respond. Please try again." });
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
            _logger.LogWarning(ex, "Interview start service error");
            return StatusCode(422, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error starting interview");
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    /// <summary>POST /api/interview/answer — Submit an answer and receive feedback + next question.</summary>
    [HttpPost("answer")]
    public async Task<IActionResult> Answer([FromBody] AnswerInterviewDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto?.SessionId))
            return BadRequest(new { error = "Session ID is required." });

        if (string.IsNullOrWhiteSpace(dto.Answer))
            return BadRequest(new { error = "Answer cannot be empty." });

        if (dto.Answer.Trim().Length < 5)
            return BadRequest(new { error = "Answer is too short. Please elaborate." });

        try
        {
            var result = await _service.AnswerAsync(
                dto.SessionId.Trim(), dto.Answer.Trim(), dto.Language ?? "en");
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (TimeoutException ex)
        {
            _logger.LogWarning(ex, "Gemini timeout on interview answer");
            return StatusCode(408, new { error = "AI took too long to respond. Please try again." });
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
            _logger.LogWarning(ex, "Interview answer service error");
            return StatusCode(422, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error processing answer");
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }
}
