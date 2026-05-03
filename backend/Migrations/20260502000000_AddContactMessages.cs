using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aabu_project.Migrations
{
    /// <inheritdoc />
    public partial class AddContactMessages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContactMessages",
                columns: table => new
                {
                    Id        = table.Column<int>(type: "int", nullable: false)
                                    .Annotation("SqlServer:Identity", "1, 1"),
                    FullName  = table.Column<string>(type: "nvarchar(100)",  maxLength: 100,  nullable: false),
                    Email     = table.Column<string>(type: "nvarchar(254)",  maxLength: 254,  nullable: false),
                    Subject   = table.Column<string>(type: "nvarchar(200)",  maxLength: 200,  nullable: false),
                    Message   = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Phone     = table.Column<string>(type: "nvarchar(20)",   maxLength: 20,   nullable: true),
                    UserId    = table.Column<int>(type: "int",    nullable: true),
                    UserRole  = table.Column<string>(type: "nvarchar(50)",   maxLength: 50,   nullable: true),
                    Status    = table.Column<string>(type: "nvarchar(20)",   maxLength: 20,   nullable: false, defaultValue: "New"),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactMessages", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContactMessages_Email",
                table: "ContactMessages",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_ContactMessages_Status",
                table: "ContactMessages",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ContactMessages_CreatedAt",
                table: "ContactMessages",
                column: "CreatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "ContactMessages");
        }
    }
}
