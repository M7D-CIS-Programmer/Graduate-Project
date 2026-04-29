using aabu_project.Data;
using aabu_project.Dtos;
using aabu_project.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/SavedJobs")]
[Authorize]
public class SavedJobsController : ControllerBase
{
    private readonly MyDbContext _context;

    public SavedJobsController(MyDbContext context) => _context = context;

    private int CallerId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>GET /api/SavedJobs — returns all saved jobs for the authenticated user.</summary>
    [HttpGet]
    public async Task<IActionResult> GetSavedJobs()
    {
        var userId = CallerId;

        var saved = await _context.SavedJobs
            .Where(s => s.UserId == userId)
            .Include(s => s.Job).ThenInclude(j => j.Category)
            .OrderByDescending(s => s.SavedAt)
            .Select(s => new SavedJobDto(
                s.Id,
                s.Job.Id,
                s.Job.Title,
                s.Job.Company,
                s.Job.Location,
                s.Job.Type,
                s.Job.WorkMode,
                s.Job.SalaryMin,
                s.Job.SalaryMax,
                s.Job.IsSalaryNegotiable,
                s.Job.Status,
                s.Job.Category.Name,
                s.SavedAt
            ))
            .ToListAsync();

        return Ok(saved);
    }

    /// <summary>GET /api/SavedJobs/check/{jobId} — returns whether the caller has saved this job.</summary>
    [HttpGet("check/{jobId:int}")]
    public async Task<IActionResult> CheckSaved(int jobId)
    {
        var userId = CallerId;
        var record = await _context.SavedJobs
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == userId && s.JobId == jobId);

        return Ok(new { isSaved = record != null, savedJobId = record?.Id });
    }

    /// <summary>POST /api/SavedJobs/{jobId} — bookmarks a job for the authenticated user.</summary>
    [HttpPost("{jobId:int}")]
    public async Task<IActionResult> SaveJob(int jobId)
    {
        var userId = CallerId;

        if (!await _context.Jobs.AnyAsync(j => j.Id == jobId))
            return NotFound(new { message = "Job not found" });
        
        if (await _context.SavedJobs.AnyAsync(s => s.UserId == userId && s.JobId == jobId))
            return Conflict(new { message = "Job already saved" });

        var savedJob = new SavedJob { UserId = userId, JobId = jobId };
        _context.SavedJobs.Add(savedJob);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Job saved successfully", id = savedJob.Id });
    }

    /// <summary>DELETE /api/SavedJobs/{id} — removes a bookmark (owner-only).</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> UnsaveJob(int id)
    {
        var userId = CallerId;

        var record = await _context.SavedJobs
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (record == null)
            return NotFound(new { message = "Saved job not found" });

        _context.SavedJobs.Remove(record);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Job removed from saved" });
    }
}
