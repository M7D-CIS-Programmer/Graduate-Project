using aabu_project.Data;
using aabu_project.Models;
using aabu_project.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly MyDbContext _context;

    public JobsController(MyDbContext context)
    {
        _context = context;
    }
 
    private static JobResponseDto ToResponseDto(Job job) => new()
    {
        Id = job.Id,
        UserId = job.UserId,
        Title = job.Title,
        Description = job.Description,
        Type = job.Type,
        WorkMode = job.WorkMode,
        Responsibilities = job.Responsibilities,
        Requirements = job.Requirements,
        CategoryId = job.CategoryId,
        IsSalaryNegotiable = job.IsSalaryNegotiable,
        SalaryMin = job.SalaryMin,
        SalaryMax = job.SalaryMax,
        Features = job.Features,
        Status = job.Status,
        Location = job.Location,
        Company = job.Company,
        PostedDate = job.PostedDate,
        User = job.User != null ? new UserDto(
            job.User.Id, job.User.Name, job.User.Email,
            job.User.Location, job.User.Website, job.User.Phone,
            job.User.Description, job.User.LinkedIn, job.User.Github, job.User.Status,
            job.User.Roles?.FirstOrDefault()?.RoleName,
            job.User.CreatedAt,
            job.User.Jobs?.Count(j => j.Status == "Active") ?? 0,
            job.User.Industry
        ) : null!,
        Category = job.Category != null ? new CategoryResponseDto { Id = job.Category.Id, Name = job.Category.Name, JobCount = job.Category.Jobs?.Count ?? 0 } : null!,
        ApplicantsCount = job.Applications?.Count ?? 0
    };

    [HttpGet]
    public async Task<IActionResult> GetJobs(
        [FromQuery] string? type, 
        [FromQuery] string? workMode,
        [FromQuery] int? categoryId,
        [FromQuery] decimal? minSalary,
        [FromQuery] decimal? maxSalary,
        [FromQuery] string? q)
    {
        var query = _context.Jobs
            .Include(j => j.User)
                .ThenInclude(u => u.Roles)
            .Include(j => j.Category)
                .ThenInclude(c => c.Jobs)
            .Include(j => j.Applications)
            .AsQueryable();

        // Filter by Search Query
        if (!string.IsNullOrEmpty(q))
        {
            var search = q.ToLower();
            query = query.Where(j => 
                j.Title.ToLower().Contains(search) || 
                j.Description.ToLower().Contains(search) ||
                (j.Company != null && j.Company.ToLower().Contains(search)));
        }

        // Filter by Job Type (Full Time, Part Time, etc.)
        if (!string.IsNullOrEmpty(type))
        {
            var types = type.Split(',', StringSplitOptions.RemoveEmptyEntries);
            query = query.Where(j => types.Contains(j.Type));
        }

        // Filter by Work Mode (Remote, On-site, Hybrid)
        if (!string.IsNullOrEmpty(workMode))
        {
            var modes = workMode.Split(',', StringSplitOptions.RemoveEmptyEntries);
            query = query.Where(j => modes.Contains(j.WorkMode));
        }

        // Filter by Category
        if (categoryId.HasValue && categoryId.Value > 0)
        {
            query = query.Where(j => j.CategoryId == categoryId.Value);
        }

        // Filter by Salary Range
        if (minSalary.HasValue)
        {
            query = query.Where(j => (j.SalaryMin ?? 0) >= minSalary.Value);
        }

        if (maxSalary.HasValue)
        {
            query = query.Where(j => (j.SalaryMax ?? 0) <= maxSalary.Value);
        }

        var jobs = await query.ToListAsync();
        return Ok(jobs.Select(ToResponseDto));
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetJobsByUser(int userId)
    {
        var jobs = await _context.Jobs
            .Include(j => j.User)
                .ThenInclude(u => u.Roles)
            .Include(j => j.Category)
                .ThenInclude(c => c.Jobs)
            .Include(j => j.Applications)
            .Where(j => j.UserId == userId)
            .ToListAsync();
        return Ok(jobs.Select(ToResponseDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetJob(int id)
    {
        var job = await _context.Jobs
            .Include(j => j.User)
                .ThenInclude(u => u.Roles)
            .Include(j => j.Category)
                .ThenInclude(c => c.Jobs)
            .Include(j => j.Applications)
            .FirstOrDefaultAsync(j => j.Id == id);

        if (job == null)
            return NotFound();

        return Ok(ToResponseDto(job));
    }

    [HttpPost]
    public async Task<IActionResult> CreateJob(JobCreateDto dto)
    {
        var job = new Job
        {
            UserId = dto.UserId,
            Title = dto.Title,
            Description = dto.Description,
            Type = dto.Type,
            WorkMode = dto.WorkMode,
            Responsibilities = dto.Responsibilities,
            Requirements = dto.Requirements,
            CategoryId = dto.CategoryId,
            IsSalaryNegotiable = dto.IsSalaryNegotiable,
            SalaryMin = dto.SalaryMin,
            SalaryMax = dto.SalaryMax,
            Features = dto.Features,
            Status = dto.Status,
            Location = dto.Location,
            Company = dto.Company
        };
        _context.Jobs.Add(job);
        await _context.SaveChangesAsync();

        return Ok(job);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateJob(int id, JobUpdateDto updated)
    {
        var job = await _context.Jobs.FindAsync(id);

        if (job == null)
            return NotFound();

        job.Title = updated.Title;
        job.Description = updated.Description;
        job.Type = updated.Type;
        job.WorkMode = updated.WorkMode;
        job.Requirements = updated.Requirements;
        job.Responsibilities = updated.Responsibilities;
        job.Location = updated.Location;
        job.Company = updated.Company;

        await _context.SaveChangesAsync();

        return Ok(job);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        var job = await _context.Jobs.FindAsync(id);

        if (job == null)
            return NotFound();

        job.Status = status;
        await _context.SaveChangesAsync();

        return Ok(job);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteJob(int id)
    {
        var job = await _context.Jobs.FindAsync(id);

        if (job == null)
            return NotFound();

        _context.Jobs.Remove(job);
        await _context.SaveChangesAsync();

        return Ok();
    }
}