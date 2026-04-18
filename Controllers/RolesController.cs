using aabu_project.Data;
using aabu_project.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class RolesController(MyDbContext context) : CrudController<Role>(context)
{
    protected override DbSet<Role> GetDbSet() => Context.Roles;

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRole(int id)
    {
        var role = await Context.Roles.FindAsync(id);
        if (role == null) return NotFound();
        return Ok(role);
    }
}
