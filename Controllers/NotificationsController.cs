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
    public async Task<IActionResult> GetAll([FromQuery] int? userId = null)
    {
        IQueryable<Notification> query = Context.Notifications;
        if (userId.HasValue)
        {
            query = query.Where(n => n.UserId == userId.Value);
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

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await Context.Notifications.FindAsync(id);
        if (item == null) return NotFound();
        Context.Notifications.Remove(item);
        await Context.SaveChangesAsync();
        return Ok();
    }
}
