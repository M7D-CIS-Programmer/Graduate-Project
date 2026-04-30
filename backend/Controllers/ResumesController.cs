using aabu_project.Data;
using aabu_project.Models;
using aabu_project.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ResumesController(MyDbContext context) : ControllerBase
{
    private readonly MyDbContext Context = context;
 
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await Context.Resumes.ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Create(ResumeCreateDto dto)
    {
        var resume = new Resume
        {
            UserId = dto.UserId,
            Name = dto.Name,
            Email = dto.Email,
            Phone = dto.Phone,
            Location = dto.Location,
            Bio = dto.Bio,
            Experiences = dto.Experiences.Select(e => new Experience
            {
                JobName = e.JobName,
                CompanyName = e.CompanyName,
                StartDate = e.StartDate,
                EndDate = e.EndDate
            }).ToList(),
            Educations = dto.Educations.Select(e => new Education
            {
                EducationLevel = e.EducationLevel,
                Institution = e.Institution,
                GraduationYear = e.GraduationYear
            }).ToList(),
            Skills = dto.Skills.Select(s => new Skill
            {
                Name = s.Name
            }).ToList()
        };
        Context.Resumes.Add(resume);
        await Context.SaveChangesAsync();
        return Ok(resume);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetResume(int id)
    {
        var res = await Context.Resumes
            .Include(r => r.Experiences)
            .Include(r => r.Educations)
            .Include(r => r.Skills)
            .FirstOrDefaultAsync(r => r.Id == id);
            
        if (res == null) return NotFound();
        return Ok(res);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateResume(int id, ResumeCreateDto dto)
    {
        var res = await Context.Resumes
            .Include(r => r.Experiences)
            .Include(r => r.Educations)
            .Include(r => r.Skills)
            .FirstOrDefaultAsync(r => r.Id == id);
            
        if (res == null) return NotFound();

        // Update Personal Info
        res.Name = dto.Name;
        res.Email = dto.Email;
        res.Phone = dto.Phone;
        res.Location = dto.Location;
        res.Bio = dto.Bio;

        // Update Experiences (Clear and Re-add for simplicity)
        Context.Experiences.RemoveRange(res.Experiences);
        res.Experiences = dto.Experiences.Select(e => new Experience
        {
            JobName = e.JobName,
            CompanyName = e.CompanyName,
            StartDate = e.StartDate,
            EndDate = e.EndDate,
            ResumeId = id
        }).ToList();

        // Update Educations
        Context.Educations.RemoveRange(res.Educations);
        res.Educations = dto.Educations.Select(e => new Education
        {
            EducationLevel = e.EducationLevel,
            Institution = e.Institution,
            GraduationYear = e.GraduationYear,
            ResumeId = id
        }).ToList();

        // Update Skills
        Context.Skills.RemoveRange(res.Skills);
        res.Skills = dto.Skills.Select(s => new Skill
        {
            Name = s.Name,
            ResumeId = id
        }).ToList();

        await Context.SaveChangesAsync();
        return Ok(res);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await Context.Resumes.FindAsync(id);
        if (item == null) return NotFound();
        Context.Resumes.Remove(item);
        await Context.SaveChangesAsync();
        return Ok();
    }
    
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUserId(int userId, [FromQuery] int? viewerId = null)
    {
        var resume = await Context.Resumes
            .Include(r => r.Experiences)
            .Include(r => r.Skills)
            .Include(r => r.Educations)
            .FirstOrDefaultAsync(r => r.UserId == userId);
            
        if (resume == null) return NotFound("No resume found for this user.");

        // Notify session user if someone else viewed their resume
        if (viewerId.HasValue && viewerId.Value != userId)
        {
            var viewer = await Context.Users.FindAsync(viewerId.Value);
            var notification = new Notification
            {
                UserId = userId,
                Title = "Resume Viewed",
                Message = $"{(viewer?.Name ?? "An employer")} viewed your resume.",
                Type = "ResumeView",
                IsRead = false
            };
            Context.Notifications.Add(notification);
            await Context.SaveChangesAsync();
        }
        
        var dto = new ResumeViewDto
        {
            Id = resume.Id,
            UserId = resume.UserId,
            Name = resume.Name,
            Email = resume.Email,
            Phone = resume.Phone,
            Location = resume.Location,
            Bio = resume.Bio,
            Experiences = resume.Experiences.Select(e => new ExperienceViewDto
            {
                Id = e.Id,
                JobName = e.JobName,
                CompanyName = e.CompanyName,
                StartDate = e.StartDate,
                EndDate = e.EndDate
            }).ToList(),
            Educations = resume.Educations.Select(e => new EducationViewDto
            {
                Id = e.Id,
                EducationLevel = e.EducationLevel,
                Institution = e.Institution,
                GraduationYear = e.GraduationYear
            }).ToList(),
            Skills = resume.Skills.Select(s => new SkillViewDto
            {
                Id = s.Id,
                Name = s.Name
            }).ToList()
        };
        
        return Ok(dto);
    }
}
