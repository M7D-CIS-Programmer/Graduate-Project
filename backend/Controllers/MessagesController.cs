using aabu_project.Data;
using aabu_project.Dtos;
using aabu_project.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly MyDbContext _context;

    public MessagesController(MyDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// GET /api/Messages/application/{applicationId}?userId={userId}
    /// Returns all messages for an application thread.
    /// Only the candidate and the employer for that application may read it.
    /// </summary>
    [HttpGet("application/{applicationId}")]
    public async Task<IActionResult> GetByApplication(int applicationId, [FromQuery] int userId)
    {
        var application = await _context.ApplicationJobs
            .Include(a => a.Job)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (application == null)
            return NotFound(new { message = "Application not found." });

        var isCandidate = application.UserId == userId;
        var isEmployer  = application.Job.UserId == userId;

        if (!isCandidate && !isEmployer)
            return Forbid();

        var messages = await _context.Messages
            .Where(m => m.ApplicationJobId == applicationId)
            .Include(m => m.Sender)
            .OrderBy(m => m.SentAt)
            .Select(m => new MessageResponseDto
            {
                Id               = m.Id,
                ApplicationJobId = m.ApplicationJobId,
                SenderId         = m.SenderId,
                SenderName       = m.Sender.Name,
                SenderPicture    = m.Sender.ProfilePicture,
                Content          = m.Content,
                SentAt           = m.SentAt,
                IsRead           = m.IsRead
            })
            .ToListAsync();

        return Ok(messages);
    }

    /// <summary>
    /// GET /api/Messages/conversations/{userId}
    /// Returns a summary of all conversations the user is part of.
    /// Each conversation = one application that has at least one message,
    /// or any application where the current user is a participant.
    /// </summary>
    [HttpGet("conversations/{userId}")]
    public async Task<IActionResult> GetConversations(int userId)
    {
        // Find all applications where this user is either the candidate or the employer
        var applications = await _context.ApplicationJobs
            .Include(a => a.Job)
                .ThenInclude(j => j.User)
            .Include(a => a.User)
            .Where(a => a.UserId == userId || a.Job.UserId == userId)
            .ToListAsync();

        var applicationIds = applications.Select(a => a.Id).ToList();

        // Fetch last message and unread count per application
        var messageStats = await _context.Messages
            .Where(m => applicationIds.Contains(m.ApplicationJobId))
            .GroupBy(m => m.ApplicationJobId)
            .Select(g => new
            {
                ApplicationJobId = g.Key,
                LastMessage      = g.OrderByDescending(m => m.SentAt).First().Content,
                LastMessageAt    = g.OrderByDescending(m => m.SentAt).First().SentAt,
                UnreadCount      = g.Count(m => !m.IsRead && m.SenderId != userId)
            })
            .ToListAsync();

        var statsMap = messageStats.ToDictionary(s => s.ApplicationJobId);

        // Only return conversations that have at least one message
        var result = applications
            .Where(a => statsMap.ContainsKey(a.Id))
            .OrderByDescending(a => statsMap.TryGetValue(a.Id, out var s) ? s.LastMessageAt : DateTimeOffset.MinValue)
            .Select(a =>
            {
                var stats = statsMap.TryGetValue(a.Id, out var s) ? s : null;
                return new ConversationSummaryDto
                {
                    ApplicationJobId = a.Id,
                    JobTitle         = a.Job.Title,
                    CandidateId      = a.UserId,
                    CandidateName    = a.User.Name,
                    CandidatePicture = a.User.ProfilePicture,
                    EmployerId       = a.Job.UserId,
                    EmployerName     = a.Job.User.Name,
                    EmployerPicture  = a.Job.User.ProfilePicture,
                    LastMessage      = stats?.LastMessage,
                    LastMessageAt    = stats?.LastMessageAt,
                    UnreadCount      = stats?.UnreadCount ?? 0
                };
            })
            .ToList();

        return Ok(result);
    }

    /// <summary>
    /// GET /api/Messages/thread-info/{applicationId}?userId={userId}
    /// Returns a ConversationSummaryDto for a single application regardless of whether
    /// any messages exist yet. Used to open a fresh thread from the UI.
    /// </summary>
    [HttpGet("thread-info/{applicationId}")]
    public async Task<IActionResult> GetThreadInfo(int applicationId, [FromQuery] int userId)
    {
        var application = await _context.ApplicationJobs
            .Include(a => a.Job)
                .ThenInclude(j => j.User)
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (application == null)
            return NotFound(new { message = "Application not found." });

        var isCandidate = application.UserId == userId;
        var isEmployer  = application.Job.UserId == userId;

        if (!isCandidate && !isEmployer)
            return Forbid();

        var lastMsg = await _context.Messages
            .Where(m => m.ApplicationJobId == applicationId)
            .OrderByDescending(m => m.SentAt)
            .FirstOrDefaultAsync();

        var unreadCount = await _context.Messages
            .CountAsync(m => m.ApplicationJobId == applicationId
                          && m.SenderId != userId
                          && !m.IsRead);

        return Ok(new ConversationSummaryDto
        {
            ApplicationJobId = application.Id,
            JobTitle         = application.Job.Title,
            CandidateId      = application.UserId,
            CandidateName    = application.User.Name,
            CandidatePicture = application.User.ProfilePicture,
            EmployerId       = application.Job.UserId,
            EmployerName     = application.Job.User.Name,
            EmployerPicture  = application.Job.User.ProfilePicture,
            LastMessage      = lastMsg?.Content,
            LastMessageAt    = lastMsg?.SentAt,
            UnreadCount      = unreadCount
        });
    }

    /// <summary>
    /// POST /api/Messages
    /// Sends a message. Sender must be the candidate or employer for the application.
    /// Also creates a notification for the recipient.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Send([FromBody] MessageCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest(new { message = "Message content cannot be empty." });

        var application = await _context.ApplicationJobs
            .Include(a => a.Job)
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == dto.ApplicationJobId);

        if (application == null)
            return NotFound(new { message = "Application not found." });

        var isCandidate = application.UserId == dto.SenderId;
        var isEmployer  = application.Job.UserId == dto.SenderId;

        if (!isCandidate && !isEmployer)
            return Forbid();

        var message = new Message
        {
            ApplicationJobId = dto.ApplicationJobId,
            SenderId         = dto.SenderId,
            Content          = dto.Content.Trim(),
            SentAt           = DateTimeOffset.Now,
            IsRead           = false
        };

        _context.Messages.Add(message);

        // Notify the recipient
        var recipientId = isEmployer ? application.UserId : application.Job.UserId;
        var sender      = await _context.Users.FindAsync(dto.SenderId);

        var notification = new Notification
        {
            UserId   = recipientId,
            Title    = "New Message",
            Message  = $"{sender?.Name ?? "Someone"} sent you a message about: {application.Job.Title}",
            Type     = "Message",
            IsRead   = false,
            Receiver = isEmployer ? "Job Seeker" : "Employer",
            RelatedId = dto.ApplicationJobId
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();

        var sender2 = await _context.Users.FindAsync(dto.SenderId);
        return Ok(new MessageResponseDto
        {
            Id               = message.Id,
            ApplicationJobId = message.ApplicationJobId,
            SenderId         = message.SenderId,
            SenderName       = sender2?.Name ?? "",
            SenderPicture    = sender2?.ProfilePicture,
            Content          = message.Content,
            SentAt           = message.SentAt,
            IsRead           = message.IsRead
        });
    }

    /// <summary>
    /// PUT /api/Messages/read/{applicationId}/{userId}
    /// Marks all messages in this thread sent by the OTHER party as read.
    /// </summary>
    [HttpPut("read/{applicationId}/{userId}")]
    public async Task<IActionResult> MarkRead(int applicationId, int userId)
    {
        var unread = await _context.Messages
            .Where(m => m.ApplicationJobId == applicationId
                     && m.SenderId != userId
                     && !m.IsRead)
            .ToListAsync();

        foreach (var msg in unread)
            msg.IsRead = true;

        await _context.SaveChangesAsync();
        return Ok(new { marked = unread.Count });
    }
}
