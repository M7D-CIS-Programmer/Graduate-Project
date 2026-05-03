using System.Security.Claims;
using aabu_project.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace aabu_project.Filters
{
    /// <summary>
    /// Applied globally: rejects any authenticated request whose user account
    /// has Status = "Suspended".  Returns 403 ACCOUNT_SUSPENDED so the
    /// frontend can intercept it and show the suspension screen immediately,
    /// even if the user was already logged in when the admin suspended them.
    /// </summary>
    public class CheckSuspendedFilter : IAsyncActionFilter
    {
        private readonly MyDbContext _db;

        public CheckSuspendedFilter(MyDbContext db)
        {
            _db = db;
        }

        public async Task OnActionExecutionAsync(
            ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // Skip suspension check for actions that explicitly allow suspended users
            // (e.g. the public Contact Us submission endpoint).
            var allowSuspended = context.ActionDescriptor.FilterDescriptors
                .Any(fd => fd.Filter is AllowSuspendedAttribute);
            if (allowSuspended) { await next(); return; }

            var idClaim = context.HttpContext.User
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (idClaim != null && int.TryParse(idClaim, out int userId))
            {
                // Lightweight query — only fetches the Status column
                var status = await _db.Users
                    .Where(u => u.Id == userId)
                    .Select(u => u.Status)
                    .FirstOrDefaultAsync();

                if (string.Equals(status, "Suspended", StringComparison.OrdinalIgnoreCase))
                {
                    context.Result = new ObjectResult(new
                    {
                        error   = "ACCOUNT_SUSPENDED",
                        message = "Your account has been temporarily suspended by the administrator."
                    })
                    { StatusCode = 403 };
                    return;
                }
            }

            await next();
        }
    }
}
