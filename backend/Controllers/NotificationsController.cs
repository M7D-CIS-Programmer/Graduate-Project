using aabu_project.Data;
using aabu_project.Models;
using aabu_project.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController(MyDbContext context) : ControllerBase
{
    private readonly MyDbContext Context = context;
 
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? userId = null, [FromQuery] string? receiver = null)
    {
        IQueryable<Notification> query = Context.Notifications;
        if (userId.HasValue)
        {
            query = query.Where(n => n.UserId == userId.Value);
        }
        if (!string.IsNullOrEmpty(receiver))
        {
            query = query.Where(n => n.Receiver == receiver);
        }
        return Ok(await query.OrderByDescending(n => n.Id).ToListAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create(NotificationCreateDto dto)
    {
        var notif = new Notification
        {
            UserId = dto.UserId,
            Title = dto.Title,
            Message = dto.Message,
            IsRead = false
        };
        Context.Notifications.Add(notif);
        await Context.SaveChangesAsync();
        return Ok(notif);
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var item = await Context.Notifications.FindAsync(id);
        if (item == null) return NotFound();
        item.IsRead = true;
        await Context.SaveChangesAsync();
        return Ok();
    }

    [HttpPut("read-all/{userId}")]
    public async Task<IActionResult> MarkAllAsRead(int userId)
    {
        var items = await Context.Notifications.Where(n => n.UserId == userId && !n.IsRead).ToListAsync();
        foreach (var item in items)
        {
            item.IsRead = true;
        }
        await Context.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await Context.Notifications.FindAsync(id);
        if (item == null) return NotFound();
        Context.Notifications.Remove(item);
        await Context.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("clear-all/{userId}")]
    public async Task<IActionResult> ClearAll(int userId)
    {
        var items = await Context.Notifications.Where(n => n.UserId == userId).ToListAsync();
        Context.Notifications.RemoveRange(items);
        await Context.SaveChangesAsync();
        return Ok();
    }
}
