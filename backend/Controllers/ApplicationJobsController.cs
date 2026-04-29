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

        return Ok(await query.ToListAsync());
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
    public async Task<IActionResult> Apply(ApplicationJobCreateDto dto)
    {
        var app = new ApplicationJob
        {
            JobId = dto.JobId,
            UserId = dto.UserId,
            Note = dto.Note,
            Cv = dto.Cv,
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
                Receiver = "Employer"
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