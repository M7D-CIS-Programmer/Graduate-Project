using aabu_project.Data;
using aabu_project.Dtos;
using aabu_project.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class DepartmentsController(MyDbContext context) : ControllerBase
{
    private readonly MyDbContext _ctx = context;

    private int CallerId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── GET /api/Departments ───────────────────────────────────────────────────
    // Public — returns ALL departments (global seed + all company departments).
    // Used by job seekers and job-listing filters.
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _ctx.Departments
            .Select(c => new DepartmentResponseDto
            {
                Id        = c.Id,
                Name      = c.Name,
                JobCount  = c.Jobs.Count,
                CreatedAt = c.CreatedAt,
            })
            .OrderBy(c => c.Name)
            .ToListAsync());

    // ── GET /api/Departments/mine ──────────────────────────────────────────────
    // Authenticated employer only — returns only THIS company's departments.
    [HttpGet("mine")]
    [Authorize]
    public async Task<IActionResult> GetMine()
    {
        var userId = CallerId;

        var list = await _ctx.Departments
            .Where(c => c.UserId == userId)
            .Select(c => new DepartmentResponseDto
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

    // ── POST /api/Departments ──────────────────────────────────────────────────
    // Authenticated — creates a department owned by the caller.
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] DepartmentCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { error = "Department name is required." });

        var userId = CallerId;

        var duplicate = await _ctx.Departments
            .AnyAsync(c => c.UserId == userId && c.Name.ToLower() == dto.Name.Trim().ToLower());
        if (duplicate)
            return Conflict(new { error = "You already have a department with this name." });

        var dept = new Department
        {
            Name   = dto.Name.Trim(),
            UserId = userId,
        };

        _ctx.Departments.Add(dept);
        await _ctx.SaveChangesAsync();

        return Ok(new DepartmentResponseDto
        {
            Id        = dept.Id,
            Name      = dept.Name,
            JobCount  = 0,
            CreatedAt = dept.CreatedAt,
        });
    }

    // ── PUT /api/Departments/{id} ──────────────────────────────────────────────
    // Authenticated — update only if the caller owns this department.
    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] DepartmentUpdateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { error = "Department name is required." });

        var userId = CallerId;
        var dept    = await _ctx.Departments.FindAsync(id);

        if (dept is null)           return NotFound(new { error = "Department not found." });
        if (dept.UserId != userId)  return Forbid();

        var duplicate = await _ctx.Departments
            .AnyAsync(c => c.UserId == userId && c.Id != id &&
                           c.Name.ToLower() == dto.Name.Trim().ToLower());
        if (duplicate)
            return Conflict(new { error = "You already have a department with this name." });

        dept.Name = dto.Name.Trim();
        await _ctx.SaveChangesAsync();

        return Ok(new DepartmentResponseDto
        {
            Id        = dept.Id,
            Name      = dept.Name,
            JobCount  = await _ctx.Jobs.CountAsync(j => j.DepartmentId == id),
            CreatedAt = dept.CreatedAt,
        });
    }

    // ── DELETE /api/Departments/{id} ───────────────────────────────────────────
    // Authenticated — delete only if the caller owns this department.
    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = CallerId;
        var dept    = await _ctx.Departments.FindAsync(id);

        if (dept is null)           return NotFound(new { error = "Department not found." });
        if (dept.UserId != userId)  return Forbid();

        _ctx.Departments.Remove(dept);
        await _ctx.SaveChangesAsync();

        return Ok(new { message = "Department deleted successfully." });
    }
}
