using aabu_project.Data;
using aabu_project.Dtos;
using aabu_project.Filters;
using aabu_project.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly MyDbContext _context;
    private readonly ILogger<ContactController> _logger;

    private static readonly HashSet<string> ValidStatuses =
        new(StringComparer.OrdinalIgnoreCase) { "New", "InProgress", "Resolved", "Closed" };

    public ContactController(MyDbContext context, ILogger<ContactController> logger)
    {
        _context = context;
        _logger  = logger;
    }

    // ── POST /api/contact ─────────────────────────────────────────────────────
    // Public endpoint — no auth required.
    // [AllowSuspended] ensures CheckSuspendedFilter does NOT block suspended users
    // so they can still reach the support form.

    [HttpPost]
    [AllowAnonymous]
    [AllowSuspended]
    public async Task<IActionResult> Submit([FromBody] ContactMessageCreateDto dto)
    {
        if (dto == null) return BadRequest(new { error = "Request body is required." });

        // Spam guard — same email+subject in the last 10 minutes
        var tenMinutesAgo = DateTimeOffset.Now.AddMinutes(-10);
        var isDuplicate = await _context.ContactMessages.AnyAsync(m =>
            m.Email   == dto.Email.Trim().ToLower() &&
            m.Subject == dto.Subject.Trim() &&
            m.CreatedAt > tenMinutesAgo);

        if (isDuplicate)
            return StatusCode(429, new { error = "DUPLICATE_SUBMISSION",
                message = "You have already submitted a similar message recently. Please wait a few minutes before trying again." });

        var msg = new ContactMessage
        {
            FullName  = dto.FullName.Trim(),
            Email     = dto.Email.Trim().ToLower(),
            Subject   = dto.Subject.Trim(),
            Message   = dto.Message.Trim(),
            Phone     = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim(),
            UserId    = dto.UserId,
            UserRole  = string.IsNullOrWhiteSpace(dto.UserRole) ? null : dto.UserRole.Trim(),
            Status    = "New",
            CreatedAt = DateTimeOffset.Now
        };

        _context.ContactMessages.Add(msg);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Contact message submitted. Id={Id} Email={Email}", msg.Id, msg.Email);
        return Ok(new { id = msg.Id, message = "Your message has been received. We will get back to you shortly." });
    }

    // ── GET /api/contact ──────────────────────────────────────────────────────
    // Admin: list all messages with search, filter, pagination.

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? q,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (!IsAdmin()) return Forbid();
        if (page < 1) page = 1;
        if (pageSize is < 1 or > 100) pageSize = 20;

        var query = _context.ContactMessages.AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var lower = q.Trim().ToLower();
            query = query.Where(m =>
                m.FullName.ToLower().Contains(lower) ||
                m.Email.ToLower().Contains(lower)    ||
                m.Subject.ToLower().Contains(lower));
        }

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(m => m.Status == status);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new ContactMessageResponseDto
            {
                Id        = m.Id,
                FullName  = m.FullName,
                Email     = m.Email,
                Subject   = m.Subject,
                Message   = m.Message,
                Phone     = m.Phone,
                UserId    = m.UserId,
                UserRole  = m.UserRole,
                Status    = m.Status,
                CreatedAt = m.CreatedAt,
                UpdatedAt = m.UpdatedAt
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    // ── GET /api/contact/{id} ─────────────────────────────────────────────────

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        if (!IsAdmin()) return Forbid();

        var m = await _context.ContactMessages.FindAsync(id);
        if (m == null) return NotFound();

        return Ok(new ContactMessageResponseDto
        {
            Id        = m.Id,
            FullName  = m.FullName,
            Email     = m.Email,
            Subject   = m.Subject,
            Message   = m.Message,
            Phone     = m.Phone,
            UserId    = m.UserId,
            UserRole  = m.UserRole,
            Status    = m.Status,
            CreatedAt = m.CreatedAt,
            UpdatedAt = m.UpdatedAt
        });
    }

    // ── PUT /api/contact/{id}/status ──────────────────────────────────────────

    [HttpPut("{id}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] ContactStatusUpdateDto dto)
    {
        if (!IsAdmin()) return Forbid();

        if (!ValidStatuses.Contains(dto.Status))
            return BadRequest(new { error = $"Invalid status. Allowed: {string.Join(", ", ValidStatuses)}" });

        var m = await _context.ContactMessages.FindAsync(id);
        if (m == null) return NotFound();

        m.Status    = dto.Status;
        m.UpdatedAt = DateTimeOffset.Now;
        await _context.SaveChangesAsync();

        return Ok(new { id = m.Id, status = m.Status, updatedAt = m.UpdatedAt });
    }

    // ── DELETE /api/contact/{id} ──────────────────────────────────────────────

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        if (!IsAdmin()) return Forbid();

        var m = await _context.ContactMessages.FindAsync(id);
        if (m == null) return NotFound();

        _context.ContactMessages.Remove(m);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Message deleted successfully." });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private bool IsAdmin()
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        return string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase);
    }
}
