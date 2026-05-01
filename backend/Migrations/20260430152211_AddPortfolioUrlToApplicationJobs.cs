using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aabu_project.Migrations
{
    /// <inheritdoc />
    public partial class AddPortfolioUrlToApplicationJobs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PortfolioUrl",
                table: "ApplicationJobs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "ApplicationJobs",
                keyColumn: "Id",
                keyValue: 1,
                column: "PortfolioUrl",
                value: "https://portfolio.example.com/ahmad");

            migrationBuilder.UpdateData(
                table: "ApplicationJobs",
                keyColumn: "Id",
                keyValue: 2,
                column: "PortfolioUrl",
                value: "https://portfolio.example.com/sara");

            migrationBuilder.UpdateData(
                table: "ApplicationJobs",
                keyColumn: "Id",
                keyValue: 3,
                column: "PortfolioUrl",
                value: "https://portfolio.example.com/omar");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PortfolioUrl",
                table: "ApplicationJobs");
        }
    }
}
