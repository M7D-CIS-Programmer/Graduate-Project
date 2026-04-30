using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using aabu_project.Models; // استبدل YourProject باسم مشروعك أو المجلد اللي فيه Models

namespace aabu_project.Data
{
    public class MyDbContext : DbContext
    {
        public MyDbContext(DbContextOptions<MyDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Resume> Resumes { get; set; }
        public DbSet<Experience> Experiences { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<Education> Educations { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<ApplicationJob> ApplicationJobs { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<SavedJob> SavedJobs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed Categories
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Technology" },
                new Category { Id = 2, Name = "Design" },
                new Category { Id = 3, Name = "Marketing" },
                new Category { Id = 4, Name = "Finance" },
                new Category { Id = 5, Name = "Healthcare" }
            );

            // Seed Users
            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, Name = "Ahmad Al-Hassan", Email = "ahmad@example.com", Pass = "password", Location = "Dubai, UAE", Phone = "+971501234567", Status = "Active", Industry = "Software", Description = "Senior software engineer with 8 years of experience.", LinkedIn = "linkedin.com/in/ahmad", Github = "github.com/ahmad" },
                new User { Id = 2, Name = "Sara Malik", Email = "sara@example.com", Pass = "password", Location = "Abu Dhabi, UAE", Phone = "+971502345678", Status = "Active", Industry = "Design", Description = "Creative UI/UX designer passionate about user-centered design." },
                new User { Id = 3, Name = "Tech Corp", Email = "hr@techcorp.com", Pass = "password", Location = "Dubai, UAE", Website = "techcorp.com", Status = "Active", Industry = "Technology", Description = "Leading technology company specializing in enterprise solutions." },
                new User { Id = 4, Name = "Omar Khalid", Email = "omar@example.com", Pass = "password", Location = "Sharjah, UAE", Phone = "+971503456789", Status = "Active", Industry = "Marketing", Description = "Digital marketing specialist with expertise in SEO and social media." },
                new User { Id = 100, Name = "Admin System", Email = "admin@example.com", Pass = "admin123", Location = "Remote", Status = "Active", Industry = "Administration", Description = "System Administrator" }
            );

            // Seed Roles
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, UserId = 1, RoleName = "Job Seeker" },
                new Role { Id = 2, UserId = 2, RoleName = "Job Seeker" },
                new Role { Id = 3, UserId = 3, RoleName = "Employer" },
                new Role { Id = 4, UserId = 4, RoleName = "Job Seeker" },
                new Role { Id = 100, UserId = 100, RoleName = "Admin" }
            );

            // Seed Jobs
            modelBuilder.Entity<Job>().HasData(
                new Job { Id = 1, UserId = 3, Title = "Senior React Developer", Description = "Build amazing UIs for our enterprise platform used by thousands of clients worldwide.", Type = "Full Time", WorkMode = "Remote", Responsibilities = "Develop and maintain React applications, collaborate with backend teams, conduct code reviews, mentor junior developers.", Requirements = "5+ years React, TypeScript, Redux, REST APIs", CategoryId = 1, SalaryMin = 120000, SalaryMax = 160000, Status = "Active", Location = "Remote", Company = "Dubai Tech Solutions" },
                new Job { Id = 2, UserId = 3, Title = "UI/UX Designer", Description = "Design clean, intuitive interfaces for web and mobile applications.", Type = "Full Time", WorkMode = "On-site", Responsibilities = "Create wireframes, prototypes, and high-fidelity designs. Conduct user research and usability testing.", Requirements = "3+ years experience, Figma, Adobe XD, user research skills", CategoryId = 2, SalaryMin = 100000, SalaryMax = 140000, Status = "Active", Location = "Abu Dhabi", Company = "Creative Studio UAE" },
                new Job { Id = 3, UserId = 3, Title = "Backend .NET Developer", Description = "Develop and maintain scalable ASP.NET Core APIs for our cloud platform.", Type = "Full Time", WorkMode = "Hybrid", Responsibilities = "Design RESTful APIs, optimize database queries, implement security best practices.", Requirements = "4+ years .NET, C#, Entity Framework, SQL Server", CategoryId = 1, SalaryMin = 110000, SalaryMax = 150000, Status = "Active", Location = "Dubai", Company = "Tech Corp" },
                new Job { Id = 4, UserId = 3, Title = "Digital Marketing Manager", Description = "Lead our digital marketing efforts across all channels.", Type = "Full Time", WorkMode = "On-site", Responsibilities = "Manage SEO/SEM campaigns, oversee social media strategy, analyze performance metrics.", Requirements = "5+ years digital marketing, Google Ads, Meta Ads, analytics tools", CategoryId = 3, SalaryMin = 90000, SalaryMax = 120000, Status = "Active", Location = "Sharjah", Company = "Growth Agency" },
                new Job { Id = 5, UserId = 3, Title = "Financial Analyst", Description = "Analyze financial data and provide insights to support business decisions.", Type = "Full Time", WorkMode = "On-site", Responsibilities = "Prepare financial reports, build forecasting models, monitor KPIs.", Requirements = "CFA or CPA preferred, Excel, Power BI, 3+ years experience", CategoryId = 4, SalaryMin = 95000, SalaryMax = 130000, Status = "Active", Location = "Dubai", Company = "Finance Global" },
                new Job { Id = 6, UserId = 3, Title = "Mobile Developer (React Native)", Description = "Build cross-platform mobile apps for iOS and Android.", Type = "Contract", WorkMode = "Remote", Responsibilities = "Develop features, integrate APIs, optimize app performance.", Requirements = "3+ years React Native, TypeScript, push notifications, app store publishing", CategoryId = 1, SalaryMin = 80000, SalaryMax = 110000, Status = "Active", Location = "Remote", Company = "App Builders" }
            );

            // Seed Resumes
            modelBuilder.Entity<Resume>().HasData(
                new Resume { Id = 1, UserId = 1, Name = "Ahmad Al-Hassan", Email = "ahmad@example.com", Phone = "+971501234567", Location = "Dubai, UAE", Bio = "Passionate software engineer with expertise in full-stack development and cloud technologies." },
                new Resume { Id = 2, UserId = 2, Name = "Sara Malik", Email = "sara@example.com", Phone = "+971502345678", Location = "Abu Dhabi, UAE", Bio = "Creative designer with a strong eye for detail and a passion for crafting exceptional user experiences." },
                new Resume { Id = 3, UserId = 4, Name = "Omar Khalid", Email = "omar@example.com", Phone = "+971503456789", Location = "Sharjah, UAE", Bio = "Results-driven marketing professional with a proven track record in growing digital presence." }
            );

            // Seed Experiences
            modelBuilder.Entity<Experience>().HasData(
                new Experience { Id = 1, ResumeId = 1, JobName = "Senior Software Engineer", CompanyName = "Dubai Tech Solutions", StartDate = "2020-03-01", EndDate = null },
                new Experience { Id = 2, ResumeId = 1, JobName = "Software Developer", CompanyName = "Gulf Digital Agency", StartDate = "2017-06-01", EndDate = "2020-02-28" },
                new Experience { Id = 3, ResumeId = 2, JobName = "UI/UX Designer", CompanyName = "Creative Studio UAE", StartDate = "2021-01-01", EndDate = null },
                new Experience { Id = 4, ResumeId = 3, JobName = "Digital Marketing Specialist", CompanyName = "Growth Agency", StartDate = "2019-08-01", EndDate = null }
            );

            // Seed Educations
            modelBuilder.Entity<Education>().HasData(
                new Education { Id = 1, ResumeId = 1, EducationLevel = "Bachelor's", Institution = "University of Dubai", GraduationYear = 2017 },
                new Education { Id = 2, ResumeId = 2, EducationLevel = "Bachelor's", Institution = "Abu Dhabi University", GraduationYear = 2020 },
                new Education { Id = 3, ResumeId = 3, EducationLevel = "Master's", Institution = "American University of Sharjah", GraduationYear = 2019 }
            );

            // Seed Skills
            modelBuilder.Entity<Skill>().HasData(
                new Skill { Id = 1, ResumeId = 1, Name = "React" },
                new Skill { Id = 2, ResumeId = 1, Name = "C#" },
                new Skill { Id = 3, ResumeId = 1, Name = "ASP.NET Core" },
                new Skill { Id = 4, ResumeId = 1, Name = "SQL" },
                new Skill { Id = 5, ResumeId = 2, Name = "Figma" },
                new Skill { Id = 6, ResumeId = 2, Name = "Adobe XD" },
                new Skill { Id = 7, ResumeId = 2, Name = "Prototyping" },
                new Skill { Id = 8, ResumeId = 3, Name = "SEO" },
                new Skill { Id = 9, ResumeId = 3, Name = "Google Ads" },
                new Skill { Id = 10, ResumeId = 3, Name = "Meta Ads" }
            );

            // Seed Notifications
            modelBuilder.Entity<Notification>().HasData(
                new Notification { Id = 1, UserId = 1, Title = "Application Received", Message = "Your application for Senior React Developer has been received.", Type = "info", IsRead = false, Receiver = "Job Seeker", CreatedAt = DateTime.Now.AddMinutes(-30) },
                new Notification { Id = 2, UserId = 1, Title = "Profile Viewed", Message = "An employer viewed your profile.", Type = "info", IsRead = true, Receiver = "Job Seeker", CreatedAt = DateTime.Now.AddHours(-2) },
                new Notification { Id = 3, UserId = 2, Title = "New Job Match", Message = "A new UI/UX Designer position matches your profile.", Type = "success", IsRead = false, Receiver = "Job Seeker", CreatedAt = DateTime.Now.AddDays(-1) },
                new Notification { Id = 4, UserId = 3, Title = "New Application", Message = "Ahmad Al-Hassan applied for Senior React Developer.", Type = "info", IsRead = false, Receiver = "Employer", CreatedAt = DateTime.Now.AddDays(-3) }
            );

            // Seed ApplicationJobs
            modelBuilder.Entity<ApplicationJob>().HasData(
                new ApplicationJob { Id = 1, JobId = 1, UserId = 1, Date = new DateTime(2025, 3, 10), CandidateStatus = "Applied", CompanyStatus = "Under Review", Note = "Strong candidate with relevant experience.", Cv = "ahmad_cv.pdf" },
                new ApplicationJob { Id = 2, JobId = 2, UserId = 2, Date = new DateTime(2025, 3, 12), CandidateStatus = "Applied", CompanyStatus = "Shortlisted", Note = "Great portfolio.", Cv = "sara_cv.pdf" },
                new ApplicationJob { Id = 3, JobId = 4, UserId = 4, Date = new DateTime(2025, 3, 15), CandidateStatus = "Applied", CompanyStatus = "Under Review", Note = "Solid marketing background.", Cv = "omar_cv.pdf" }
            );

            // Fix SQL Server cyclic reference issue
            modelBuilder.Entity<ApplicationJob>()
                .HasOne(aj => aj.User)
                .WithMany(u => u.Applications)
                .HasForeignKey(aj => aj.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Precision for salary
            modelBuilder.Entity<Job>()
                .Property(j => j.SalaryMin)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Job>()
                .Property(j => j.SalaryMax)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SavedJob>()
                .HasOne(s => s.User)
                .WithMany(u => u.SavedJobs)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SavedJob>()
                .HasOne(s => s.Job)
                .WithMany(j => j.SavedJobs)
                .HasForeignKey(s => s.JobId)
                .OnDelete(DeleteBehavior.Restrict);

            // Prevent the same user from saving the same job twice at the database level
            modelBuilder.Entity<SavedJob>()
                .HasIndex(s => new { s.UserId, s.JobId })
                .IsUnique()
                .HasDatabaseName("UX_SavedJobs_UserId_JobId");

            // Prevent the same user from applying to the same job twice at the database level
            modelBuilder.Entity<ApplicationJob>()
                .HasIndex(aj => new { aj.UserId, aj.JobId })
                .IsUnique()
                .HasDatabaseName("UX_ApplicationJobs_UserId_JobId");
        }
    }
}