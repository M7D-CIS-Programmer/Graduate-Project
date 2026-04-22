using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aabu_project.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedAtToNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Notifications",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 1,
                column: "PostedDate",
                value: new DateTime(2026, 4, 22, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5276));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 2,
                column: "PostedDate",
                value: new DateTime(2026, 4, 22, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5285));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 3,
                column: "PostedDate",
                value: new DateTime(2026, 4, 22, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5289));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 4,
                column: "PostedDate",
                value: new DateTime(2026, 4, 22, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5293));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 5,
                column: "PostedDate",
                value: new DateTime(2026, 4, 22, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5297));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 6,
                column: "PostedDate",
                value: new DateTime(2026, 4, 22, 21, 16, 20, 347, DateTimeKind.Utc).AddTicks(5300));

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Notifications");

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 1,
                column: "PostedDate",
                value: new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(683));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 2,
                column: "PostedDate",
                value: new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(691));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 3,
                column: "PostedDate",
                value: new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(695));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 4,
                column: "PostedDate",
                value: new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(698));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 5,
                column: "PostedDate",
                value: new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(703));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 6,
                column: "PostedDate",
                value: new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(706));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(589));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(601));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(605));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(608));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 100,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 11, 16, 30, 18, 376, DateTimeKind.Utc).AddTicks(611));
        }
    }
}
