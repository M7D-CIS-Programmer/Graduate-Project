using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aabu_project.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Industry",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Company",
                table: "Jobs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Jobs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Company", "Location", "PostedDate" },
                values: new object[] { "Dubai Tech Solutions", "Remote", new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(683) });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Company", "Location", "PostedDate" },
                values: new object[] { "Creative Studio UAE", "Abu Dhabi", new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(691) });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Company", "Location", "PostedDate" },
                values: new object[] { "Tech Corp", "Dubai", new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(695) });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Company", "Location", "PostedDate" },
                values: new object[] { "Growth Agency", "Sharjah", new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(698) });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Company", "Location", "PostedDate" },
                values: new object[] { "Finance Global", "Dubai", new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(703) });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Company", "Location", "PostedDate" },
                values: new object[] { "App Builders", "Remote", new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(706) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "Industry" },
                values: new object[] { new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(589), "Software" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "Industry" },
                values: new object[] { new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(601), "Design" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "Industry" },
                values: new object[] { new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(605), "Technology" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedAt", "Industry" },
                values: new object[] { new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(608), "Marketing" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 100,
                columns: new[] { "CreatedAt", "Industry" },
                values: new object[] { new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(611), "Administration" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Industry",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Company",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Jobs");

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 1,
                column: "PostedDate",
                value: new DateTime(2026, 4, 11, 15, 3, 44, 566, DateTimeKind.Utc).AddTicks(5022));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 2,
                column: "PostedDate",
                value: new DateTime(2026, 4, 11, 15, 3, 44, 566, DateTimeKind.Utc).AddTicks(5031));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 3,
                column: "PostedDate",
                value: new DateTime(2026, 4, 11, 15, 3, 44, 566, DateTimeKind.Utc).AddTicks(5034));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 4,
                column: "PostedDate",
                value: new DateTime(2026, 4, 11, 15, 3, 44, 566, DateTimeKind.Utc).AddTicks(5037));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 5,
                column: "PostedDate",
                value: new DateTime(2026, 4, 11, 15, 3, 44, 566, DateTimeKind.Utc).AddTicks(5040));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 6,
                column: "PostedDate",
                value: new DateTime(2026, 4, 11, 15, 3, 44, 566, DateTimeKind.Utc).AddTicks(5043));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 11, 15, 3, 44, 566, DateTimeKind.Utc).AddTicks(4917));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 11, 15, 3, 44, 566, DateTimeKind.Utc).AddTicks(4930));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 11, 15, 3, 44, 566, DateTimeKind.Utc).AddTicks(4933));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 11, 15, 3, 44, 566, DateTimeKind.Utc).AddTicks(4936));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 100,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 11, 15, 3, 44, 566, DateTimeKind.Utc).AddTicks(4938));
        }
    }
}
