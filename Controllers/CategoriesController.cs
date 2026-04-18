using aabu_project.Data;
using aabu_project.Models;
using aabu_project.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController(MyDbContext context) : ControllerBase
{
    private readonly MyDbContext Context = context;
 
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await Context.Categories.ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Create(CategoryCreateDto dto)
    {
        var cat = new Category { Name = dto.Name };
        Context.Categories.Add(cat);
        await Context.SaveChangesAsync();
        return Ok(cat);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await Context.Categories.FindAsync(id);
        if (item == null) return NotFound();
        Context.Categories.Remove(item);
        await Context.SaveChangesAsync();
        return Ok();
    }
}
