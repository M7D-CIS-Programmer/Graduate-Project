using aabu_project.Data;
using aabu_project.Models;
using aabu_project.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class EducationsController(MyDbContext context) : CrudController<Education>(context)
{
    protected override DbSet<Education> GetDbSet() => Context.Educations;
 
    [HttpPost]
    public async Task<IActionResult> Create(EducationCreateDto dto)
    {
        var edu = new Education
        {
            ResumeId = dto.ResumeId,
            EducationLevel = dto.EducationLevel,
            Institution = dto.Institution,
            GraduationYear = dto.GraduationYear
        };
        Context.Educations.Add(edu);
        await Context.SaveChangesAsync();
        return Ok(edu);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetEducation(int id)
    {
        var edu = await Context.Educations.FindAsync(id);
        if (edu == null) return NotFound();
        return Ok(edu);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEducation(int id, Education updated)
    {
        var edu = await Context.Educations.FindAsync(id);
        if (edu == null) return NotFound();

        edu.EducationLevel = updated.EducationLevel;
        edu.Institution = updated.Institution;
        edu.GraduationYear = updated.GraduationYear;

        await Context.SaveChangesAsync();
        return Ok(edu);
    }
}
