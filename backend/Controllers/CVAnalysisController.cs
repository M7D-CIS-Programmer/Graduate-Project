using aabu_project.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/cv")]
[RequestSizeLimit(10_485_760)] // 10 MB
public class CVAnalysisController : ControllerBase
{
    private readonly ICVAnalysisService _cvService;
    private readonly ILogger<CVAnalysisController> _logger;

    public CVAnalysisController(ICVAnalysisService cvService, ILogger<CVAnalysisController> logger)
    {
        _cvService = cvService;
        _logger    = logger;
    }

    /// <summary>POST /api/cv/analyze — Compare a PDF CV against a job posting.</summary>
    [HttpPost("analyze")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Analyze(
        IFormFile file,
        [FromForm] string? jobTitle,
        [FromForm] string? jobDescription)
    {
        // ── Input validation ─────────────────────────────────────────────────────
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "Please upload a PDF file." });

        if (string.IsNullOrWhiteSpace(jobTitle))
            return BadRequest(new { error = "Please enter a job title." });

        if (string.IsNullOrWhiteSpace(jobDescription))
            return BadRequest(new { error = "Please enter a job description." });

        if (jobDescription.Trim().Length < 20)
            return BadRequest(new { error = "Job description is too short. Please provide more detail." });

        // ── PDF validation ───────────────────────────────────────────────────────
        var isPdf = file.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase)
                    || file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase);

        if (!isPdf)
            return BadRequest(new { error = "Only PDF files are accepted." });

        if (file.Length > 10 * 1024 * 1024)
            return BadRequest(new { error = "File size must be 10 MB or less." });

        // ── Text extraction ──────────────────────────────────────────────────────
        string cvText;
        try
        {
            using var stream = file.OpenReadStream();
            cvText = _cvService.ExtractTextFromPdf(stream);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "PDF extraction failed for {FileName}", file.FileName);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected PDF extraction error");
            return BadRequest(new { error = "Could not read this PDF. It may be corrupted or password-protected." });
        }

        if (cvText.Length < 50)
            return BadRequest(new
            {
                error = "The PDF contains very little text. " +
                        "Scanned image-only PDFs cannot be analysed — please use a text-based PDF."
            });

        // ── Gemini analysis ──────────────────────────────────────────────────────
        try
        {
            var result = await _cvService.AnalyzeCvAsync(cvText, jobTitle, jobDescription);
            return Ok(result);
        }
        catch (TimeoutException ex)
        {
            _logger.LogWarning(ex, "Gemini timed out");
            return StatusCode(408, new { error = "Analysis timed out. Please try again." });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogError(ex, "Gemini auth failure");
            return StatusCode(503, new { error = "AI service is temporarily unavailable." });
        }
        catch (InvalidOperationException ex) when (ex.Message == "QUOTA_EXCEEDED")
        {
            _logger.LogWarning("Gemini quota exceeded");
            return StatusCode(429, new { error = "Analysis quota exceeded. Please try again later." });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "CV analysis service error");
            return StatusCode(422, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CV analysis unexpected failure");
            return StatusCode(500, new { error = "An unexpected error occurred. Please try again." });
        }
    }
}
