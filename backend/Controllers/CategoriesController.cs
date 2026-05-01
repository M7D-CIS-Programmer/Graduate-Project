using aabu_project.Data;
using aabu_project.Dtos;
using aabu_project.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController(MyDbContext context) : ControllerBase
{
    private readonly MyDbContext _ctx = context;

    private int CallerId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── GET /api/Categories ───────────────────────────────────────────────────
    // Public — returns ALL categories (global seed + all company departments).
    // Used by job seekers and job-listing filters.
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _ctx.Categories
            .Select(c => new CategoryResponseDto
            {
                Id        = c.Id,
                Name      = c.Name,
                JobCount  = c.Jobs.Count,
                CreatedAt = c.CreatedAt,
            })
            .OrderBy(c => c.Name)
            .ToListAsync());

    // ── GET /api/Categories/mine ──────────────────────────────────────────────
    // Authenticated employer only — returns only THIS company's departments.
    [HttpGet("mine")]
    [Authorize]
    public async Task<IActionResult> GetMine()
    {
        var userId = CallerId;

        var list = await _ctx.Categories
            .Where(c => c.UserId == userId)
            .Select(c => new CategoryResponseDto
            {
                Id        = c.Id,
                Name      = c.Name,
                JobCount  = c.Jobs.Count,
                CreatedAt = c.CreatedAt,
            })
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(list);
    }

    // ── POST /api/Categories ──────────────────────────────────────────────────
    // Authenticated — creates a department owned by the caller.
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CategoryCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { error = "Department name is required." });

        var userId = CallerId;

        var duplicate = await _ctx.Categories
            .AnyAsync(c => c.UserId == userId && c.Name.ToLower() == dto.Name.Trim().ToLower());
        if (duplicate)
            return Conflict(new { error = "You already have a department with this name." });

        var cat = new Category
        {
            Name   = dto.Name.Trim(),
            UserId = userId,
        };

        _ctx.Categories.Add(cat);
        await _ctx.SaveChangesAsync();

        return Ok(new CategoryResponseDto
        {
            Id        = cat.Id,
            Name      = cat.Name,
            JobCount  = 0,
            CreatedAt = cat.CreatedAt,
        });
    }

    // ── PUT /api/Categories/{id} ──────────────────────────────────────────────
    // Authenticated — update only if the caller owns this department.
    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] CategoryUpdateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { error = "Department name is required." });

        var userId = CallerId;
        var cat    = await _ctx.Categories.FindAsync(id);

        if (cat is null)           return NotFound(new { error = "Department not found." });
        if (cat.UserId != userId)  return Forbid();

        var duplicate = await _ctx.Categories
            .AnyAsync(c => c.UserId == userId && c.Id != id &&
                           c.Name.ToLower() == dto.Name.Trim().ToLower());
        if (duplicate)
            return Conflict(new { error = "You already have a department with this name." });

        cat.Name = dto.Name.Trim();
        await _ctx.SaveChangesAsync();

        return Ok(new CategoryResponseDto
        {
            Id        = cat.Id,
            Name      = cat.Name,
            JobCount  = await _ctx.Jobs.CountAsync(j => j.CategoryId == id),
            CreatedAt = cat.CreatedAt,
        });
    }

    // ── DELETE /api/Categories/{id} ───────────────────────────────────────────
    // Authenticated — delete only if the caller owns this department.
    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = CallerId;
        var cat    = await _ctx.Categories.FindAsync(id);

        if (cat is null)           return NotFound(new { error = "Department not found." });
        if (cat.UserId != userId)  return Forbid();

        _ctx.Categories.Remove(cat);
        await _ctx.SaveChangesAsync();

        return Ok(new { message = "Department deleted successfully." });
    }
}
