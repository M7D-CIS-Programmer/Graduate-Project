using aabu_project.Data;
using aabu_project.Models;
using aabu_project.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ApplicationJobsController : ControllerBase
{
    private readonly MyDbContext _context;

    public ApplicationJobsController(MyDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// GET /api/ApplicationJobs?employerId={id}
    /// Returns applications for the given employer's jobs only.
    /// Omit employerId (admin use) to return all applications.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int? employerId)
    {
        var query = _context.ApplicationJobs
            .Include(a => a.Job)
                .ThenInclude(j => j.User)
            .Include(a => a.User)
            .AsQueryable();

        if (employerId.HasValue)
            query = query.Where(a => a.Job.UserId == employerId.Value);

        return Ok(await query.OrderByDescending(a => a.Date).ToListAsync());
    }

    /// <summary>
    /// Returns only applications for jobs posted by the specified company (employer).
    /// Filters by Job.UserId == companyId to prevent cross-company data leakage.
    /// </summary>
    [HttpGet("company/{companyId}")]
    public async Task<IActionResult> GetByCompany(int companyId)
    {
        var applications = await _context.ApplicationJobs
            .Include(a => a.Job)
                .ThenInclude(j => j.User)
            .Include(a => a.User)
            .Where(a => a.Job.UserId == companyId)
            .OrderByDescending(a => a.Date)
            .ToListAsync();

        return Ok(applications);
    }

    [HttpPost]
    [Consumes("application/json")]
    public async Task<IActionResult> ApplyJson([FromBody] ApplicationJobCreateDto dto)
    {
        return await CreateApplication(dto, dto.Cv);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Apply([FromForm] ApplicationJobCreateDto dto)
    {
        string? cvPath = dto.Cv;

        if (dto.CvFile != null)
        {
            var ext = Path.GetExtension(dto.CvFile.FileName).ToLowerInvariant();
            var isPdfExt = ext == ".pdf";
            var isPdfMime = string.Equals(dto.CvFile.ContentType, "application/pdf", StringComparison.OrdinalIgnoreCase);

            if (!isPdfExt && !isPdfMime)
                return BadRequest(new { message = "Only PDF CV files are allowed." });

            if (dto.CvFile.Length <= 0)
                return BadRequest(new { message = "Uploaded CV file is empty." });

            if (dto.CvFile.Length > 10 * 1024 * 1024)
                return BadRequest(new { message = "CV file is too large. Maximum size is 10 MB." });

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "cvs");
            Directory.CreateDirectory(uploadsFolder);

            var safeName = $"{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(uploadsFolder, safeName);

            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.CvFile.CopyToAsync(stream);
            }

            cvPath = Path.Combine("uploads", "cvs", safeName).Replace("\\", "/");
        }

        return await CreateApplication(dto, cvPath);
    }

    private async Task<IActionResult> CreateApplication(ApplicationJobCreateDto dto, string? cvPath)
    {
        if (dto == null) 
            return BadRequest(new { message = "Invalid application data." });

        if (dto.JobId <= 0 || dto.UserId <= 0)
            return BadRequest(new { message = $"Missing IDs. JobId: {dto.JobId}, UserId: {dto.UserId}" });

        var existingApp = await _context.ApplicationJobs
            .FirstOrDefaultAsync(a => a.JobId == dto.JobId && a.UserId == dto.UserId);

        if (existingApp != null)
        {
            return BadRequest(new { message = "You have already applied for this job." });
        }

        var app = new ApplicationJob
        {
            JobId = dto.JobId,
            UserId = dto.UserId,
            Note = dto.Note,
            Cv = string.IsNullOrWhiteSpace(cvPath) ? null : cvPath.Trim(),
            Date = DateTime.Now,
            CandidateStatus = "Applied"
        };

        _context.ApplicationJobs.Add(app);
        
        // Notify Employer
        var job = await _context.Jobs.FindAsync(dto.JobId);
        if (job != null)
        {
            var seeker = await _context.Users.FindAsync(dto.UserId);
            var notification = new Notification
            {
                UserId = job.UserId,
                Title = "New Job Application",
                Message = $"{seeker?.Name ?? "A candidate"} applied for your job: {job.Title}",
                Type = "Application",
                IsRead = false,
                Receiver = "Employer",
                RelatedId = dto.UserId
            };
            _context.Notifications.Add(notification);

            // Notify Seeker (Confirmation)
            var seekerNotification = new Notification
            {
                UserId = dto.UserId,
                Title = "Application Sent",
                Message = $"Your application for '{job.Title}' has been sent successfully.",
                Type = "Info",
                IsRead = false,
                Receiver = "Job Seeker"
            };
            _context.Notifications.Add(seekerNotification);
        }

        await _context.SaveChangesAsync();
        return Ok(app);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] ApplicationStatusUpdateDto dto)
    {
        var app = await _context.ApplicationJobs
            .Include(a => a.Job)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (app == null)
            return NotFound();

        var oldStatus = app.CandidateStatus;
        app.CandidateStatus = dto.Status;
        
        // Notify Job Seeker if status actually changed
        if (oldStatus != dto.Status)
        {
            var notification = new Notification
            {
                UserId = app.UserId,
                Title = "Application Status Update",
                Message = $"Your application for '{app.Job.Title}' has been updated to: {dto.Status}",
                Type = "StatusUpdate",
                IsRead = false,
                Receiver = "Job Seeker"
            };
            _context.Notifications.Add(notification);
        }

        await _context.SaveChangesAsync();
        return Ok(app);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var app = await _context.ApplicationJobs.FindAsync(id);

        if (app == null)
            return NotFound();

        _context.ApplicationJobs.Remove(app);
        await _context.SaveChangesAsync();

        return Ok();
    }
}
