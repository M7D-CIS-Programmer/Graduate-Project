using aabu_project.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
public abstract class CrudController<T>(MyDbContext context) : ControllerBase
    where T : class
{
    protected readonly MyDbContext Context = context;

    protected abstract DbSet<T> GetDbSet();

    [HttpGet]
    public virtual async Task<IActionResult> GetAll() => Ok(await GetDbSet().ToListAsync());

    [HttpPost]
    public virtual async Task<IActionResult> Create([FromBody] T item)
    {
        GetDbSet().Add(item);
        await Context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id}")]
    public virtual async Task<IActionResult> Delete(int id)
    {
        var item = await GetDbSet().FindAsync(id);
        if (item == null) return NotFound();
        GetDbSet().Remove(item);
        await Context.SaveChangesAsync();
        return Ok();
    }
}
