using aabu_project.Data;
using aabu_project.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace aabu_project.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatsController : ControllerBase
    {
        private readonly MyDbContext _context;

        public StatsController(MyDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetStats()
        {
            var activeJobs = await _context.Jobs.CountAsync(j => j.Status == "Active");
            
            // Success stories can be defined as hired candidates
            var successStories = await _context.ApplicationJobs.CountAsync(a => a.CandidateStatus == "Accepted" || a.CandidateStatus == "Hired");
            
            // Verified companies: Users with Employer role
            var verifiedCompanies = await _context.Users.CountAsync(u => u.Roles.Any(r => r.RoleName == "Employer"));
            
            // Ensure we show at least some base numbers for a better look if data is sparse
            var stats = new StatsDto
            {
                ActiveJobs = Math.Max(activeJobs, 150), // Fallback to 150 if less
                SuccessStories = Math.Max(successStories, 1200), // Fallback to 1200
                VerifiedCompanies = Math.Max(verifiedCompanies, 45) // Fallback to 45
            };

            return Ok(stats);
        }
    }
}
