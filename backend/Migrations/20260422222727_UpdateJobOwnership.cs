using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aabu_project.Migrations
{
    /// <inheritdoc />
    public partial class UpdateJobOwnership : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "PostedDate", "UserId" },
                values: new object[] { new DateTime(2026, 4, 22, 22, 27, 27, 205, DateTimeKind.Utc).AddTicks(2373), 3 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "PostedDate", "UserId" },
                values: new object[] { new DateTime(2026, 4, 22, 22, 27, 27, 205, DateTimeKind.Utc).AddTicks(2382), 3 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "PostedDate", "UserId" },
                values: new object[] { new DateTime(2026, 4, 22, 22, 27, 27, 205, DateTimeKind.Utc).AddTicks(2387), 3 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "PostedDate", "UserId" },
                values: new object[] { new DateTime(2026, 4, 22, 22, 27, 27, 205, DateTimeKind.Utc).AddTicks(2390), 3 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "PostedDate", "UserId" },
                values: new object[] { new DateTime(2026, 4, 22, 22, 27, 27, 205, DateTimeKind.Utc).AddTicks(2395), 3 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "PostedDate", "UserId" },
                values: new object[] { new DateTime(2026, 4, 22, 22, 27, 27, 205, DateTimeKind.Utc).AddTicks(2413), 3 });

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 22, 21, 57, 27, 205, DateTimeKind.Utc).AddTicks(2604));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 22, 20, 27, 27, 205, DateTimeKind.Utc).AddTicks(2611));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 22, 27, 27, 205, DateTimeKind.Utc).AddTicks(2615));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 22, 27, 27, 205, DateTimeKind.Utc).AddTicks(2619));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 22, 22, 27, 27, 205, DateTimeKind.Utc).AddTicks(2284));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 22, 22, 27, 27, 205, DateTimeKind.Utc).AddTicks(2297));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 22, 22, 27, 27, 205, DateTimeKind.Utc).AddTicks(2300));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 22, 22, 27, 27, 205, DateTimeKind.Utc).AddTicks(2304));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 100,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 22, 22, 27, 27, 205, DateTimeKind.Utc).AddTicks(2307));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "PostedDate", "UserId" },
                values: new object[] { new DateTime(2026, 4, 22, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5276), 1 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "PostedDate", "UserId" },
                values: new object[] { new DateTime(2026, 4, 22, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5285), 1 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "PostedDate", "UserId" },
                values: new object[] { new DateTime(2026, 4, 22, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5289), 1 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "PostedDate", "UserId" },
                values: new object[] { new DateTime(2026, 4, 22, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5293), 1 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "PostedDate", "UserId" },
                values: new object[] { new DateTime(2026, 4, 22, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5297), 1 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "PostedDate", "UserId" },
                values: new object[] { new DateTime(2026, 4, 22, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5300), 1 });

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 22, 20, 46, 20, 347, DateTimeKind.Utc).AddTicks(5502));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 22, 19, 16, 20, 347, DateTimeKind.Utc).AddTicks(5511));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5516));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5519));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 22, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5183));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 22, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5196));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 22, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5199));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 22, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5203));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 100,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 22, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5206));
        }
    }
}
