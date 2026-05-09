using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aabu_project.Migrations
{
    /// <inheritdoc />
    public partial class SyncRemainingSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 1,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 22, 43, 867, DateTimeKind.Unspecified).AddTicks(3), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 2,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 22, 43, 867, DateTimeKind.Unspecified).AddTicks(16), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 3,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 22, 43, 867, DateTimeKind.Unspecified).AddTicks(70), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 4,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 22, 43, 867, DateTimeKind.Unspecified).AddTicks(75), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 5,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 22, 43, 867, DateTimeKind.Unspecified).AddTicks(81), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 6,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 22, 43, 867, DateTimeKind.Unspecified).AddTicks(85), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 15, 52, 43, 867, DateTimeKind.Unspecified).AddTicks(245), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 14, 22, 43, 867, DateTimeKind.Unspecified).AddTicks(261), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 8, 16, 22, 43, 867, DateTimeKind.Unspecified).AddTicks(267), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 6, 16, 22, 43, 867, DateTimeKind.Unspecified).AddTicks(271), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 22, 43, 866, DateTimeKind.Unspecified).AddTicks(9874), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 22, 43, 866, DateTimeKind.Unspecified).AddTicks(9919), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 22, 43, 866, DateTimeKind.Unspecified).AddTicks(9923), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 22, 43, 866, DateTimeKind.Unspecified).AddTicks(9927), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 100,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 22, 43, 866, DateTimeKind.Unspecified).AddTicks(9931), new TimeSpan(0, 3, 0, 0, 0)));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 1,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 21, 15, 77, DateTimeKind.Unspecified).AddTicks(8962), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 2,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 21, 15, 77, DateTimeKind.Unspecified).AddTicks(8977), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 3,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 21, 15, 77, DateTimeKind.Unspecified).AddTicks(9102), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 4,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 21, 15, 77, DateTimeKind.Unspecified).AddTicks(9110), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 5,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 21, 15, 77, DateTimeKind.Unspecified).AddTicks(9114), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 6,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 21, 15, 77, DateTimeKind.Unspecified).AddTicks(9118), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 15, 51, 15, 77, DateTimeKind.Unspecified).AddTicks(9290), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 14, 21, 15, 77, DateTimeKind.Unspecified).AddTicks(9304), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 8, 16, 21, 15, 77, DateTimeKind.Unspecified).AddTicks(9310), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 6, 16, 21, 15, 77, DateTimeKind.Unspecified).AddTicks(9314), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 21, 15, 77, DateTimeKind.Unspecified).AddTicks(8833), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 21, 15, 77, DateTimeKind.Unspecified).AddTicks(8875), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 21, 15, 77, DateTimeKind.Unspecified).AddTicks(8880), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 21, 15, 77, DateTimeKind.Unspecified).AddTicks(8884), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 100,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 9, 16, 21, 15, 77, DateTimeKind.Unspecified).AddTicks(8888), new TimeSpan(0, 3, 0, 0, 0)));
        }
    }
}
