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
        DepartmentId = job.DepartmentId,
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
            job.User.Industry,
            job.User.ProfilePicture,
            job.User.Followers?.Count ?? 0
        ) : null!,
        Department = job.Department != null ? new DepartmentResponseDto { Id = job.Department.Id, Name = job.Department.Name, JobCount = job.Department.Jobs?.Count ?? 0 } : null!,
        ApplicantsCount = job.Applications?.Count ?? 0,
        ViewsCount = job.ViewsCount
    };

    [HttpGet]
    public async Task<IActionResult> GetJobs(
        [FromQuery] string? type, 
        [FromQuery] string? workMode,
        [FromQuery] int? departmentId,
        [FromQuery] decimal? minSalary,
        [FromQuery] decimal? maxSalary,
        [FromQuery] string? q)
    {
        var query = _context.Jobs
            .Include(j => j.User)
                .ThenInclude(u => u.Roles)
            .Include(j => j.User)
                .ThenInclude(u => u.Followers)
            .Include(j => j.Department)
                .ThenInclude(c => c.Jobs)
            .Include(j => j.Applications)
            .AsQueryable();

        // Filter by Search Query
        if (!string.IsNullOrEmpty(q))
        {
            var normalized = aabu_project.Utilities.SearchUtility.Normalize(q);
            var equivalent = aabu_project.Utilities.SearchUtility.GetEquivalent(normalized);
            var terms = new List<string> { normalized };
            if (equivalent != normalized) terms.Add(equivalent);

            query = query.Where(j => terms.Any(t => 
                (j.SearchKey != null && j.SearchKey.Contains(t)) ||
                j.Title.Contains(t) || 
                j.Description.Contains(t) ||
                (j.Company != null && j.Company.Contains(t))));
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

        // Filter by Department
        if (departmentId.HasValue && departmentId.Value > 0)
        {
            query = query.Where(j => j.DepartmentId == departmentId.Value);
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
            .Include(j => j.User)
                .ThenInclude(u => u.Followers)
            .Include(j => j.Department)
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
            .Include(j => j.User)
                .ThenInclude(u => u.Followers)
            .Include(j => j.Department)
                .ThenInclude(c => c.Jobs)
            .Include(j => j.Applications)
            .FirstOrDefaultAsync(j => j.Id == id);

        if (job == null)
            return NotFound();

        // Increment Views
        job.ViewsCount++;
        await _context.SaveChangesAsync();

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
            DepartmentId = dto.DepartmentId,
            IsSalaryNegotiable = dto.IsSalaryNegotiable,
            SalaryMin = dto.SalaryMin,
            SalaryMax = dto.SalaryMax,
            Features = dto.Features,
            Status = dto.Status,
            Location = dto.Location,
            Company = dto.Company,
            SearchKey = aabu_project.Utilities.SearchUtility.GenerateSearchKey(dto.Title, dto.Description, dto.Company, dto.Location)
        };
        _context.Jobs.Add(job);
        await _context.SaveChangesAsync();

        var created = await _context.Jobs
            .Include(j => j.User)
            .Include(j => j.Department)
                .ThenInclude(d => d.Jobs)
            .FirstOrDefaultAsync(j => j.Id == job.Id);

        return Ok(ToResponseDto(created!));
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
        job.Responsibilities = updated.Responsibilities;
        job.Requirements = updated.Requirements;
        job.DepartmentId = updated.DepartmentId;
        job.SalaryMin = updated.SalaryMin;
        job.SalaryMax = updated.SalaryMax;
        job.IsSalaryNegotiable = updated.IsSalaryNegotiable;
        job.Features = updated.Features;
        job.Location = updated.Location;
        job.Company = updated.Company;
        job.SearchKey = aabu_project.Utilities.SearchUtility.GenerateSearchKey(updated.Title, updated.Description, updated.Company, updated.Location);

        await _context.SaveChangesAsync();

        var refreshed = await _context.Jobs
            .Include(j => j.User)
            .Include(j => j.Department)
                .ThenInclude(d => d.Jobs)
            .FirstOrDefaultAsync(j => j.Id == id);

        return Ok(ToResponseDto(refreshed!));
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
        var job = await _context.Jobs
            .Include(j => j.SavedJobs)
            .Include(j => j.Applications)
            .FirstOrDefaultAsync(j => j.Id == id);

        if (job == null)
            return NotFound();

        // Remove related records first to avoid foreign key constraint violations
        if (job.SavedJobs.Any())
        {
            _context.SavedJobs.RemoveRange(job.SavedJobs);
        }

        if (job.Applications.Any())
        {
            _context.ApplicationJobs.RemoveRange(job.Applications);
        }

        _context.Jobs.Remove(job);
        await _context.SaveChangesAsync();

        return Ok();
    }
}