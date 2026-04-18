using aabu_project.Data;
using aabu_project.Models;
using aabu_project.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class SkillsController(MyDbContext context) : ControllerBase
{
    private readonly MyDbContext Context = context;
 
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await Context.Skills.ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Create(SkillCreateDto dto)
    {
        var skill = new Skill
        {
            ResumeId = dto.ResumeId,
            Name = dto.Name
        };
        Context.Skills.Add(skill);
        await Context.SaveChangesAsync();
        return Ok(skill);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await Context.Skills.FindAsync(id);
        if (item == null) return NotFound();
        Context.Skills.Remove(item);
        await Context.SaveChangesAsync();
        return Ok();
    }
}
