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
    public async Task<IActionResult> GetUnifiedSearch([FromQuery] string q, [FromQuery] string? role = null, [FromQuery] int? userId = null, [FromQuery] string lang = "en")
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
        var normalizedRole = role?.Trim().ToLower();

        // 2. Fetch Data from DB with security filtering
        if (normalizedRole == "admin")
        {
            // Admins see all jobs
            var jobsQuery = _context.Jobs.AsQueryable();
            response.Jobs = await ApplyMultilingualFilter(jobsQuery, searchTerms)
                .Select(j => new SearchResultDto { Id = j.Id, Title = j.Title, Description = j.Company ?? "Company", Type = "Job", Link = $"/jobs/{j.Id}" })
                .Take(5)
                .ToListAsync();

            // Admins see all users
            var usersQuery = _context.Users.AsQueryable();
            response.Candidates = await ApplyMultilingualFilter(usersQuery, searchTerms)
                .Select(u => new SearchResultDto { Id = u.Id, Title = u.Name, Description = u.Email, Type = "User", Link = $"/profile/{u.Id}" })
                .Take(5)
                .ToListAsync();

            // Admins can search contact messages
            var messagesQuery = _context.ContactMessages.AsQueryable();
            foreach (var term in searchTerms)
            {
                messagesQuery = messagesQuery.Where(m => m.Name.Contains(term) || m.Email.Contains(term) || m.Subject.Contains(term));
            }
            response.ContactMessages = await messagesQuery
                .Select(m => new SearchResultDto { Id = m.Id, Title = m.Subject, Description = m.Name, Type = "ContactMessage", Link = "/dashboard/admin/contact-messages" })
                .Take(5)
                .ToListAsync();
        }
        else if (normalizedRole == "employer" || normalizedRole == "company")
        {
            // Employers see their own jobs
            var jobsQuery = _context.Jobs.Where(j => j.UserId == userId);
            response.Jobs = await ApplyMultilingualFilter(jobsQuery, searchTerms)
                .Select(j => new SearchResultDto { Id = j.Id, Title = j.Title, Description = j.Status ?? "Active", Type = "Job", Link = $"/jobs/{j.Id}" })
                .Take(5)
                .ToListAsync();

            // Employers see all job seekers
            var candidateQuery = _context.Users
                .Include(u => u.Roles)
                .Where(u => u.Roles.Any(r => r.RoleName == "Job Seeker"));
            response.Candidates = await ApplyMultilingualFilter(candidateQuery, searchTerms)
                .Select(u => new SearchResultDto { Id = u.Id, Title = u.Name, Description = u.Industry ?? "Professional", Type = "Candidate", Link = $"/profile/{u.Id}" })
                .Take(5)
                .ToListAsync();
        }
        else // Job Seeker or Guest
        {
            // Jobs (all)
            var jobsQuery = _context.Jobs.AsQueryable();
            response.Jobs = await ApplyMultilingualFilter(jobsQuery, searchTerms)
                .Select(j => new SearchResultDto { Id = j.Id, Title = j.Title, Description = j.Company ?? "Company", Type = "Job", Link = $"/jobs/{j.Id}" })
                .Take(5)
                .ToListAsync();

            // Companies (all)
            var companyQuery = _context.Users
                .Include(u => u.Roles)
                .Where(u => u.Roles.Any(r => r.RoleName == "Employer" || r.RoleName == "Company"));
            response.Companies = await ApplyMultilingualFilter(companyQuery, searchTerms)
                .Select(u => new SearchResultDto { Id = u.Id, Title = u.Name, Description = u.Industry ?? "Company", Type = "Company", Link = $"/profile/{u.Id}" })
                .Take(5)
                .ToListAsync();
        }

        // 3. Static Pages Search (Multilingual Mapping)
        var pagesList = GetMultilingualPages(normalizedRole, lang);
        response.Pages = pagesList
            .Where(p => searchTerms.Any(t => p.SearchKey != null && p.SearchKey.Contains(t)))
            .Take(8)
            .ToList();

        return Ok(response);
    }

    private IQueryable<T> ApplyMultilingualFilter<T>(IQueryable<T> query, List<string> terms) where T : class
    {
        if (typeof(T) == typeof(Job))
        {
            var q = (IQueryable<Job>)query;
            foreach (var term in terms)
            {
                q = q.Where(j => (j.SearchKey != null && j.SearchKey.Contains(term)) || j.Title.Contains(term) || (j.Description != null && j.Description.Contains(term)));
            }
            return (IQueryable<T>)q;
        }
        if (typeof(T) == typeof(User))
        {
            var q = (IQueryable<User>)query;
            foreach (var term in terms)
            {
                q = q.Where(u => (u.SearchKey != null && u.SearchKey.Contains(term)) || u.Name.Contains(term) || (u.Industry != null && u.Industry.Contains(term)) || (u.Email != null && u.Email.Contains(term)));
            }
            return (IQueryable<T>)q;
        }
        return query;
    }

    private List<SearchResultDto> GetMultilingualPages(string? role, string lang)
    {
        var list = new List<SearchResultDto>();
        void AddPage(string enTitle, string arTitle, string enDesc, string arDesc, string link)
        {
            list.Add(new SearchResultDto 
            { 
                Title = lang == "ar" ? arTitle : enTitle, 
                Description = lang == "ar" ? arDesc : enDesc, 
                Type = "Page", 
                Link = link, 
                SearchKey = SearchUtility.GenerateSearchKey(enTitle, arTitle, enDesc, arDesc) 
            });
        }

        // --- Public Pages ---
        AddPage("Home", "الرئيسية", "Welcome to InsightCV", "مرحباً بكم في InsightCV", "/");
        AddPage("Jobs", "الوظائف", "Browse all jobs", "تصفح جميع الوظائف", "/jobs");
        AddPage("Companies", "الشركات", "Explore companies", "استكشف الشركات", "/companies");
        AddPage("About Us", "من نحن", "Our mission and values", "مهمتنا وقيمنا", "/about");
        AddPage("Contact Us", "اتصل بنا", "Get in touch with us", "تواصل معنا", "/contact");
        AddPage("FAQ", "الأسئلة الشائعة", "Frequently asked questions", "الأسئلة المتكررة", "/faq");
        AddPage("Privacy Policy", "سياسة الخصوصية", "How we protect your data", "كيف نحمي بياناتك", "/privacy-policy");
        AddPage("Terms of Service", "شروط الخدمة", "Platform rules and usage", "قواعد المنصة والاستخدام", "/terms-of-service");
        AddPage("Support Bot", "مساعد الدعم", "Chat with our AI assistant", "تحدث مع مساعدنا الذكي", "/chatbot");

        // --- Authenticated Pages ---
        if (!string.IsNullOrEmpty(role))
        {
            AddPage("Profile", "الملف الشخصي", "View your profile", "عرض ملفك الشخصي", "/profile");
            AddPage("Edit Profile", "تعديل الملف", "Update your information", "تحديث معلوماتك", "/profile/edit");
            AddPage("Settings", "الإعدادات", "Account and preferences", "الحساب والتفضيلات", "/settings");
            AddPage("Notifications", "الإشعارات", "Your alerts and updates", "تنبيهاتك وتحديثاتك", "/notifications");
            AddPage("Messages", "الرسائل", "Your conversations", "محادثاتك", "/messages");
            AddPage("AI Interview", "مقابلة الذكاء الاصطناعي", "Practice technical interviews", "تدريب على المقابلات التقنية", "/interview");
            AddPage("Job Matching", "مطابقة الوظائف", "AI-powered job matching", "مطابقة الوظائف بالذكاء الاصطناعي", "/job-matching");
        }

        // --- Admin Pages ---
        if (role == "admin")
        {
            AddPage("Admin Dashboard", "لوحة تحكم المسؤول", "System overview and stats", "نظرة عامة على النظام", "/dashboard/admin");
            AddPage("Manage Users", "إدارة المستخدمين", "View and moderate users", "عرض وإدارة المستخدمين", "/dashboard/admin/users");
            AddPage("Manage Jobs", "إدارة الوظائف", "Review all postings", "مراجعة جميع الوظائف", "/dashboard/admin/jobs");
            AddPage("Manage Companies", "إدارة الشركات", "Company verification", "تحقق من الشركات", "/dashboard/admin/companies");
            AddPage("Platform Settings", "إعدادات المنصة", "Global configuration", "الإعدادات العامة", "/dashboard/admin/settings");
            AddPage("Contact Messages", "رسائل التواصل", "Review user inquiries", "مراجعة استفسارات المستخدمين", "/dashboard/admin/contact-messages");
        }

        // --- Employer Pages ---
        if (role == "employer" || role == "company")
        {
            AddPage("Employer Dashboard", "لوحة تحكم صاحب العمل", "Recruitment overview", "نظرة عامة على التوظيف", "/dashboard/employer");
            AddPage("My Jobs", "وظائفي", "Manage your postings", "إدارة إعلاناتك", "/dashboard/employer/jobs");
            AddPage("Post a Job", "نشر وظيفة", "Create new opening", "إضافة وظيفة جديدة", "/jobs/post");
            AddPage("Applicants", "المتقدمين", "Review candidates", "مراجعة المتقدمين", "/dashboard/employer/applicants");
            AddPage("Candidate Insights", "تحليل المرشحين", "AI candidate ranking", "تحليل وتصنيف المرشحين", "/dashboard/employer/insights");
            AddPage("Fraud Detection", "كشف التزوير", "CV integrity check", "التحقق من صحة السير الذاتية", "/cv-fraud-check");
            AddPage("Departments", "الأقسام", "Manage company units", "إدارة أقسام الشركة", "/departments");
        }

        // --- Job Seeker Pages ---
        if (role == "job seeker")
        {
            AddPage("Seeker Dashboard", "لوحة تحكم الباحث", "Job search overview", "نظرة عامة على البحث", "/dashboard/seeker");
            AddPage("My Applications", "طلباتي", "Track your applications", "تتبع طلباتك", "/dashboard/seeker/applications");
            AddPage("Resume Builder", "منشئ السيرة الذاتية", "Create professional CV", "إنشاء سيرة ذاتية احترافية", "/resume-builder");
            AddPage("Candidates", "المرشحين", "Find professionals", "البحث عن مهنيين", "/candidates");
        }

        return list;
    }

}

