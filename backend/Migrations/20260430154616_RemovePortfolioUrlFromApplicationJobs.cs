using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aabu_project.Migrations
{
    /// <inheritdoc />
    public partial class RemovePortfolioUrlFromApplicationJobs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PortfolioUrl",
                table: "ApplicationJobs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PortfolioUrl",
                table: "ApplicationJobs",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
