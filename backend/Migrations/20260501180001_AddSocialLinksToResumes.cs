using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aabu_project.Migrations
{
    /// <inheritdoc />
    public partial class AddSocialLinksToResumes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(name: "LinkedIn", table: "Resumes", type: "nvarchar(max)", nullable: true);
            migrationBuilder.AddColumn<string>(name: "GitHub",   table: "Resumes", type: "nvarchar(max)", nullable: true);
            migrationBuilder.AddColumn<string>(name: "Website",  table: "Resumes", type: "nvarchar(max)", nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "LinkedIn", table: "Resumes");
            migrationBuilder.DropColumn(name: "GitHub",   table: "Resumes");
            migrationBuilder.DropColumn(name: "Website",  table: "Resumes");
        }
    }
}
