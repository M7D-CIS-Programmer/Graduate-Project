using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace aabu_project.Migrations
{
    /// <inheritdoc />
    public partial class InitialSqlServerCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Pass = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Website = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LinkedIn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Github = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Jobs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WorkMode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Responsibilities = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Requirements = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    IsSalaryNegotiable = table.Column<bool>(type: "bit", nullable: false),
                    SalaryMin = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    SalaryMax = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Features = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Jobs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Jobs_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Jobs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    Receiver = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Resumes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Bio = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resumes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Resumes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RoleName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Roles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationJobs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    JobId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CandidateStatus = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyStatus = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Cv = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationJobs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationJobs_Jobs_JobId",
                        column: x => x.JobId,
                        principalTable: "Jobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationJobs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Educations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EducationLevel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Institution = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GraduationYear = table.Column<int>(type: "int", nullable: false),
                    ResumeId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Educations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Educations_Resumes_ResumeId",
                        column: x => x.ResumeId,
                        principalTable: "Resumes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Experiences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ResumeId = table.Column<int>(type: "int", nullable: false),
                    JobName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Experiences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Experiences_Resumes_ResumeId",
                        column: x => x.ResumeId,
                        principalTable: "Resumes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Skills",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ResumeId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Skills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Skills_Resumes_ResumeId",
                        column: x => x.ResumeId,
                        principalTable: "Resumes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Technology" },
                    { 2, "Design" },
                    { 3, "Marketing" },
                    { 4, "Finance" },
                    { 5, "Healthcare" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Description", "Email", "Github", "LinkedIn", "Location", "Name", "Pass", "Phone", "Status", "Website" },
                values: new object[,]
                {
                    { 1, "Senior software engineer with 8 years of experience.", "ahmad@example.com", "github.com/ahmad", "linkedin.com/in/ahmad", "Dubai, UAE", "Ahmad Al-Hassan", "password", "+971501234567", "Active", null },
                    { 2, "Creative UI/UX designer passionate about user-centered design.", "sara@example.com", null, null, "Abu Dhabi, UAE", "Sara Malik", "password", "+971502345678", "Active", null },
                    { 3, "Leading technology company specializing in enterprise solutions.", "hr@techcorp.com", null, null, "Dubai, UAE", "Tech Corp", "password", null, "Active", "techcorp.com" },
                    { 4, "Digital marketing specialist with expertise in SEO and social media.", "omar@example.com", null, null, "Sharjah, UAE", "Omar Khalid", "password", "+971503456789", "Active", null }
                });

            migrationBuilder.InsertData(
                table: "Jobs",
                columns: new[] { "Id", "CategoryId", "Description", "Features", "IsSalaryNegotiable", "Requirements", "Responsibilities", "SalaryMax", "SalaryMin", "Status", "Title", "Type", "UserId", "WorkMode" },
                values: new object[,]
                {
                    { 1, 1, "Build amazing UIs for our enterprise platform used by thousands of clients worldwide.", null, false, "5+ years React, TypeScript, Redux, REST APIs", "Develop and maintain React applications, collaborate with backend teams, conduct code reviews, mentor junior developers.", 160000m, 120000m, "Active", "Senior React Developer", "Full Time", 1, "Remote" },
                    { 2, 2, "Design clean, intuitive interfaces for web and mobile applications.", null, false, "3+ years experience, Figma, Adobe XD, user research skills", "Create wireframes, prototypes, and high-fidelity designs. Conduct user research and usability testing.", 140000m, 100000m, "Active", "UI/UX Designer", "Full Time", 1, "On-site" },
                    { 3, 1, "Develop and maintain scalable ASP.NET Core APIs for our cloud platform.", null, false, "4+ years .NET, C#, Entity Framework, SQL Server", "Design RESTful APIs, optimize database queries, implement security best practices.", 150000m, 110000m, "Active", "Backend .NET Developer", "Full Time", 1, "Hybrid" },
                    { 4, 3, "Lead our digital marketing efforts across all channels.", null, false, "5+ years digital marketing, Google Ads, Meta Ads, analytics tools", "Manage SEO/SEM campaigns, oversee social media strategy, analyze performance metrics.", 120000m, 90000m, "Active", "Digital Marketing Manager", "Full Time", 1, "On-site" },
                    { 5, 4, "Analyze financial data and provide insights to support business decisions.", null, false, "CFA or CPA preferred, Excel, Power BI, 3+ years experience", "Prepare financial reports, build forecasting models, monitor KPIs.", 130000m, 95000m, "Active", "Financial Analyst", "Full Time", 1, "On-site" },
                    { 6, 1, "Build cross-platform mobile apps for iOS and Android.", null, false, "3+ years React Native, TypeScript, push notifications, app store publishing", "Develop features, integrate APIs, optimize app performance.", 110000m, 80000m, "Active", "Mobile Developer (React Native)", "Contract", 1, "Remote" }
                });

            migrationBuilder.InsertData(
                table: "Notifications",
                columns: new[] { "Id", "IsRead", "Message", "Receiver", "Title", "Type", "UserId" },
                values: new object[,]
                {
                    { 1, false, "Your application for Senior React Developer has been received.", "JobSeeker", "Application Received", "info", 1 },
                    { 2, true, "An employer viewed your profile.", "JobSeeker", "Profile Viewed", "info", 1 },
                    { 3, false, "A new UI/UX Designer position matches your profile.", "JobSeeker", "New Job Match", "success", 2 },
                    { 4, false, "Ahmad Al-Hassan applied for Senior React Developer.", "Employer", "New Application", "info", 3 }
                });

            migrationBuilder.InsertData(
                table: "Resumes",
                columns: new[] { "Id", "Bio", "Email", "Location", "Name", "Phone", "UserId" },
                values: new object[,]
                {
                    { 1, "Passionate software engineer with expertise in full-stack development and cloud technologies.", "ahmad@example.com", "Dubai, UAE", "Ahmad Al-Hassan", "+971501234567", 1 },
                    { 2, "Creative designer with a strong eye for detail and a passion for crafting exceptional user experiences.", "sara@example.com", "Abu Dhabi, UAE", "Sara Malik", "+971502345678", 2 },
                    { 3, "Results-driven marketing professional with a proven track record in growing digital presence.", "omar@example.com", "Sharjah, UAE", "Omar Khalid", "+971503456789", 4 }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "RoleName", "UserId" },
                values: new object[,]
                {
                    { 1, "JobSeeker", 1 },
                    { 2, "JobSeeker", 2 },
                    { 3, "Employer", 3 },
                    { 4, "JobSeeker", 4 }
                });

            migrationBuilder.InsertData(
                table: "ApplicationJobs",
                columns: new[] { "Id", "CandidateStatus", "CompanyStatus", "Cv", "Date", "JobId", "Note", "UserId" },
                values: new object[,]
                {
                    { 1, "Applied", "Under Review", "ahmad_cv.pdf", new DateTime(2025, 3, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, "Strong candidate with relevant experience.", 1 },
                    { 2, "Applied", "Shortlisted", "sara_cv.pdf", new DateTime(2025, 3, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, "Great portfolio.", 2 },
                    { 3, "Applied", "Under Review", "omar_cv.pdf", new DateTime(2025, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 4, "Solid marketing background.", 4 }
                });

            migrationBuilder.InsertData(
                table: "Educations",
                columns: new[] { "Id", "EducationLevel", "GraduationYear", "Institution", "ResumeId" },
                values: new object[,]
                {
                    { 1, "Bachelor's", 2017, "University of Dubai", 1 },
                    { 2, "Bachelor's", 2020, "Abu Dhabi University", 2 },
                    { 3, "Master's", 2019, "American University of Sharjah", 3 }
                });

            migrationBuilder.InsertData(
                table: "Experiences",
                columns: new[] { "Id", "CompanyName", "EndDate", "JobName", "ResumeId", "StartDate" },
                values: new object[,]
                {
                    { 1, "Dubai Tech Solutions", null, "Senior Software Engineer", 1, new DateTime(2020, 3, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 2, "Gulf Digital Agency", new DateTime(2020, 2, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), "Software Developer", 1, new DateTime(2017, 6, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 3, "Creative Studio UAE", null, "UI/UX Designer", 2, new DateTime(2021, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 4, "Growth Agency", null, "Digital Marketing Specialist", 3, new DateTime(2019, 8, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) }
                });

            migrationBuilder.InsertData(
                table: "Skills",
                columns: new[] { "Id", "Name", "ResumeId" },
                values: new object[,]
                {
                    { 1, "React", 1 },
                    { 2, "C#", 1 },
                    { 3, "ASP.NET Core", 1 },
                    { 4, "SQL", 1 },
                    { 5, "Figma", 2 },
                    { 6, "Adobe XD", 2 },
                    { 7, "Prototyping", 2 },
                    { 8, "SEO", 3 },
                    { 9, "Google Ads", 3 },
                    { 10, "Meta Ads", 3 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationJobs_JobId",
                table: "ApplicationJobs",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationJobs_UserId",
                table: "ApplicationJobs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Educations_ResumeId",
                table: "Educations",
                column: "ResumeId");

            migrationBuilder.CreateIndex(
                name: "IX_Experiences_ResumeId",
                table: "Experiences",
                column: "ResumeId");

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_CategoryId",
                table: "Jobs",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_UserId",
                table: "Jobs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Resumes_UserId",
                table: "Resumes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_UserId",
                table: "Roles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Skills_ResumeId",
                table: "Skills",
                column: "ResumeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApplicationJobs");

            migrationBuilder.DropTable(
                name: "Educations");

            migrationBuilder.DropTable(
                name: "Experiences");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Skills");

            migrationBuilder.DropTable(
                name: "Jobs");

            migrationBuilder.DropTable(
                name: "Resumes");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
