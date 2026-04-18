using aabu_project.Data;
using aabu_project.Models;
using aabu_project.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ExperiencesController(MyDbContext context) : CrudController<Experience>(context)
{
    protected override DbSet<Experience> GetDbSet() => Context.Experiences;
 
    [HttpPost]
    public async Task<IActionResult> Create(ExperienceCreateDto dto)
    {
        var exp = new Experience
        {
            ResumeId = dto.ResumeId,
            JobName = dto.JobName,
            CompanyName = dto.CompanyName,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate
        };
        Context.Experiences.Add(exp);
        await Context.SaveChangesAsync();
        return Ok(exp);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetExperience(int id)
    {
        var exp = await Context.Experiences.FindAsync(id);
        if (exp == null) return NotFound();
        return Ok(exp);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateExperience(int id, Experience updated)
    {
        var exp = await Context.Experiences.FindAsync(id);
        if (exp == null) return NotFound();

        exp.JobName = updated.JobName;
        exp.CompanyName = updated.CompanyName;
        exp.StartDate = updated.StartDate;
        exp.EndDate = updated.EndDate;

        await Context.SaveChangesAsync();
        return Ok(exp);
    }
}
