using aabu_project.Data;
using aabu_project.Models;
using aabu_project.Dtos;
using aabu_project.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace aabu_project.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController(MyDbContext context) : ControllerBase
{
    private readonly MyDbContext _context = context;

    [HttpGet]
    public async Task<IActionResult> GetUnifiedSearch([FromQuery] string q, [FromQuery] string? role = null, [FromQuery] int? userId = null)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new SearchResponseDto());

        // 1. Detect language and normalize query
        bool queryIsArabic = SearchUtility.IsArabic(q);
        var normalizedQuery = SearchUtility.Normalize(q);
        var equivalentQuery = SearchUtility.GetEquivalent(normalizedQuery);
        
        var searchTerms = new List<string> { normalizedQuery };
        if (equivalentQuery != normalizedQuery) searchTerms.Add(equivalentQuery);

        var response = new SearchResponseDto();

        // 2. Fetch Data from DB using SearchKey or manual matching
        if (role == "Employer")
        {
            // Jobs: match search_key (which contains both EN/AR)
            var jobsQuery = _context.Jobs.Where(j => j.UserId == userId);
            response.Jobs = await ApplyMultilingualFilter(jobsQuery, searchTerms)
                .Select(j => new SearchResultDto { Id = j.Id, Title = j.Title, Description = j.Status ?? "Active", Type = "Job", Link = $"/jobs/{j.Id}" })
                .ToListAsync();

            // Candidates
            var candidateQuery = _context.Users
                .Include(u => u.Roles)
                .Where(u => u.Roles.Any(r => r.RoleName == "Job Seeker"));
            response.Candidates = await ApplyMultilingualFilter(candidateQuery, searchTerms)
                .Select(u => new SearchResultDto { Id = u.Id, Title = u.Name, Description = u.Industry ?? "Professional", Type = "Candidate", Link = $"/profile/{u.Id}" })
                .ToListAsync();
        }
        else // Job Seeker or Guest
        {
            // Jobs
            var jobsQuery = _context.Jobs.AsQueryable();
            response.Jobs = await ApplyMultilingualFilter(jobsQuery, searchTerms)
                .Select(j => new SearchResultDto { Id = j.Id, Title = j.Title, Description = j.Company ?? "Company", Type = "Job", Link = $"/jobs/{j.Id}" })
                .ToListAsync();

            // Companies
            var companyQuery = _context.Users
                .Include(u => u.Roles)
                .Where(u => u.Roles.Any(r => r.RoleName == "Employer" || r.RoleName == "Company"));
            response.Companies = await ApplyMultilingualFilter(companyQuery, searchTerms)
                .Select(u => new SearchResultDto { Id = u.Id, Title = u.Name, Description = u.Industry ?? "Company", Type = "Company", Link = $"/profile/{u.Id}" })
                .ToListAsync();
        }

        // 3. Static Pages Search (Multilingual Mapping)
        var pagesList = GetMultilingualPages(role);
        response.Pages = pagesList
            .Where(p => searchTerms.Any(t => p.SearchKey != null && p.SearchKey.Contains(t)))
            .ToList();

        // 4. Sort results based on language relevance
        SortByLanguage(response.Jobs, queryIsArabic);
        SortByLanguage(response.Candidates, queryIsArabic);
        SortByLanguage(response.Companies, queryIsArabic);
        SortByLanguage(response.Pages, queryIsArabic);

        return Ok(response);
    }

    private IQueryable<T> ApplyMultilingualFilter<T>(IQueryable<T> query, List<string> terms) where T : class
    {
        // For models with SearchKey, use it. Otherwise fallback to Title/Name/Description
        if (typeof(T) == typeof(Job))
        {
            var q = (IQueryable<Job>)query;
            foreach (var term in terms)
            {
                q = q.Where(j => (j.SearchKey != null && j.SearchKey.Contains(term)) || j.Title.Contains(term) || j.Description.Contains(term));
            }
            return (IQueryable<T>)q;
        }
        if (typeof(T) == typeof(User))
        {
            var q = (IQueryable<User>)query;
            foreach (var term in terms)
            {
                q = q.Where(u => (u.SearchKey != null && u.SearchKey.Contains(term)) || u.Name.Contains(term) || (u.Industry != null && u.Industry.Contains(term)));
            }
            return (IQueryable<T>)q;
        }
        return query;
    }

    private List<SearchResultDto> GetMultilingualPages(string? role)
    {
        var list = new List<SearchResultDto>();
        // Add pages with bilingual SearchKeys
        void AddPage(string enTitle, string arTitle, string enDesc, string arDesc, string link)
        {
            list.Add(new SearchResultDto 
            { 
                Title = enTitle, 
                Description = enDesc, 
                Type = "Page", 
                Link = link, 
                SearchKey = SearchUtility.GenerateSearchKey(enTitle, arTitle, enDesc, arDesc) 
            });
        }

        if (!string.IsNullOrEmpty(role))
        {
            AddPage("Dashboard", "لوحة التحكم", "Overview", "نظرة عامة", "/dashboard");
            AddPage("Profile", "الملف الشخصي", "Manage account", "إدارة الحساب", "/profile");
            AddPage("Settings", "الإعدادات", "Account settings", "إعدادات الحساب", "/settings");
            AddPage("Notifications", "الإشعارات", "Your alerts", "تنبيهاتك", "/notifications");
        }

        if (role == "Employer")
        {
            AddPage("My Jobs", "وظائفي", "Your postings", "إعلاناتك", "/my-jobs");
            AddPage("Post a Job", "نشر وظيفة", "Add new opening", "إضافة وظيفة جديدة", "/post-job");
            AddPage("Candidates", "المرشحين", "Find talent", "البحث عن مواهب", "/candidates");
        }
        else if (role == "Job Seeker")
        {
            AddPage("My Applications", "طلباتي", "Track status", "تتبع الطلبات", "/my-applications");
            AddPage("Saved Jobs", "الوظائف المحفوظة", "Your bookmarks", "محفوظاتك", "/saved-jobs");
            AddPage("Resume Builder", "منشئ السيرة الذاتية", "Create CV", "إنشاء سيرة ذاتية", "/resume-builder");
            AddPage("Find Jobs", "البحث عن وظائف", "Browse all jobs", "تصفح جميع الوظائف", "/jobs");
        }

        return list;
    }

    private void SortByLanguage(List<SearchResultDto> results, bool queryIsArabic)
    {
        if (results == null || results.Count <= 1) return;

        // Rank results that match the query language first
        results.Sort((a, b) => {
            bool aIsAr = SearchUtility.IsArabic(a.Title);
            bool bIsAr = SearchUtility.IsArabic(b.Title);
            
            if (queryIsArabic)
            {
                if (aIsAr && !bIsAr) return -1;
                if (!aIsAr && bIsAr) return 1;
            }
            else
            {
                if (!aIsAr && bIsAr) return -1;
                if (aIsAr && !bIsAr) return 1;
            }
            return 0;
        });
    }
}

