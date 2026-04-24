using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aabu_project.Migrations
{
    /// <inheritdoc />
    public partial class AddJobViewsCount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ViewsCount",
                table: "Jobs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "PostedDate", "ViewsCount" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 23, 2, 24, 10, 459, DateTimeKind.Unspecified).AddTicks(7157), new TimeSpan(0, 3, 0, 0, 0)), 0 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "PostedDate", "ViewsCount" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 23, 2, 24, 10, 459, DateTimeKind.Unspecified).AddTicks(7168), new TimeSpan(0, 3, 0, 0, 0)), 0 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "PostedDate", "ViewsCount" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 23, 2, 24, 10, 459, DateTimeKind.Unspecified).AddTicks(7172), new TimeSpan(0, 3, 0, 0, 0)), 0 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "PostedDate", "ViewsCount" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 23, 2, 24, 10, 459, DateTimeKind.Unspecified).AddTicks(7176), new TimeSpan(0, 3, 0, 0, 0)), 0 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "PostedDate", "ViewsCount" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 23, 2, 24, 10, 459, DateTimeKind.Unspecified).AddTicks(7181), new TimeSpan(0, 3, 0, 0, 0)), 0 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "PostedDate", "ViewsCount" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 23, 2, 24, 10, 459, DateTimeKind.Unspecified).AddTicks(7185), new TimeSpan(0, 3, 0, 0, 0)), 0 });

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 1, 54, 10, 459, DateTimeKind.Unspecified).AddTicks(7362), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 0, 24, 10, 459, DateTimeKind.Unspecified).AddTicks(7379), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 22, 2, 24, 10, 459, DateTimeKind.Unspecified).AddTicks(7385), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 20, 2, 24, 10, 459, DateTimeKind.Unspecified).AddTicks(7390), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 24, 10, 459, DateTimeKind.Unspecified).AddTicks(7022), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 24, 10, 459, DateTimeKind.Unspecified).AddTicks(7061), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 24, 10, 459, DateTimeKind.Unspecified).AddTicks(7065), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 24, 10, 459, DateTimeKind.Unspecified).AddTicks(7071), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 100,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 24, 10, 459, DateTimeKind.Unspecified).AddTicks(7075), new TimeSpan(0, 3, 0, 0, 0)));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ViewsCount",
                table: "Jobs");

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 1,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 17, 43, 271, DateTimeKind.Unspecified).AddTicks(6532), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 2,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 17, 43, 271, DateTimeKind.Unspecified).AddTicks(6554), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 3,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 17, 43, 271, DateTimeKind.Unspecified).AddTicks(6560), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 4,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 17, 43, 271, DateTimeKind.Unspecified).AddTicks(6565), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 5,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 17, 43, 271, DateTimeKind.Unspecified).AddTicks(6570), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 6,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 17, 43, 271, DateTimeKind.Unspecified).AddTicks(6575), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 1, 47, 43, 271, DateTimeKind.Unspecified).AddTicks(6769), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 0, 17, 43, 271, DateTimeKind.Unspecified).AddTicks(6788), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 22, 2, 17, 43, 271, DateTimeKind.Unspecified).AddTicks(6795), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 20, 2, 17, 43, 271, DateTimeKind.Unspecified).AddTicks(6801), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 17, 43, 271, DateTimeKind.Unspecified).AddTicks(6403), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 17, 43, 271, DateTimeKind.Unspecified).AddTicks(6446), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 17, 43, 271, DateTimeKind.Unspecified).AddTicks(6451), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 17, 43, 271, DateTimeKind.Unspecified).AddTicks(6456), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 100,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 17, 43, 271, DateTimeKind.Unspecified).AddTicks(6459), new TimeSpan(0, 3, 0, 0, 0)));
        }
    }
}
