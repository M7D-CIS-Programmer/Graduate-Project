using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aabu_project.Migrations
{
    /// <inheritdoc />
    public partial class AddFollowCompany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FollowCompanies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    FollowedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FollowCompanies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FollowCompanies_Users_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FollowCompanies_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 1,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 14, 18, 6, 228, DateTimeKind.Unspecified).AddTicks(2483), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 2,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 14, 18, 6, 228, DateTimeKind.Unspecified).AddTicks(2498), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 3,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 14, 18, 6, 228, DateTimeKind.Unspecified).AddTicks(2507), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 4,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 14, 18, 6, 228, DateTimeKind.Unspecified).AddTicks(2514), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 5,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 14, 18, 6, 228, DateTimeKind.Unspecified).AddTicks(2540), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 6,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 14, 18, 6, 228, DateTimeKind.Unspecified).AddTicks(2553), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 13, 48, 6, 228, DateTimeKind.Unspecified).AddTicks(2970), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 12, 18, 6, 228, DateTimeKind.Unspecified).AddTicks(2997), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 29, 14, 18, 6, 228, DateTimeKind.Unspecified).AddTicks(3009), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 27, 14, 18, 6, 228, DateTimeKind.Unspecified).AddTicks(3018), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 14, 18, 6, 228, DateTimeKind.Unspecified).AddTicks(2206), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 14, 18, 6, 228, DateTimeKind.Unspecified).AddTicks(2285), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 14, 18, 6, 228, DateTimeKind.Unspecified).AddTicks(2296), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 14, 18, 6, 228, DateTimeKind.Unspecified).AddTicks(2304), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 100,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 14, 18, 6, 228, DateTimeKind.Unspecified).AddTicks(2311), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.CreateIndex(
                name: "IX_FollowCompanies_CompanyId",
                table: "FollowCompanies",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "UX_FollowCompany_UserId_CompanyId",
                table: "FollowCompanies",
                columns: new[] { "UserId", "CompanyId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FollowCompanies");

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 1,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 12, 54, 45, 242, DateTimeKind.Unspecified).AddTicks(2854), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 2,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 12, 54, 45, 242, DateTimeKind.Unspecified).AddTicks(2865), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 3,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 12, 54, 45, 242, DateTimeKind.Unspecified).AddTicks(2870), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 4,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 12, 54, 45, 242, DateTimeKind.Unspecified).AddTicks(2875), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 5,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 12, 54, 45, 242, DateTimeKind.Unspecified).AddTicks(2880), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 6,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 12, 54, 45, 242, DateTimeKind.Unspecified).AddTicks(2885), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 12, 24, 45, 242, DateTimeKind.Unspecified).AddTicks(3078), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 10, 54, 45, 242, DateTimeKind.Unspecified).AddTicks(3098), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 29, 12, 54, 45, 242, DateTimeKind.Unspecified).AddTicks(3104), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 27, 12, 54, 45, 242, DateTimeKind.Unspecified).AddTicks(3110), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 12, 54, 45, 242, DateTimeKind.Unspecified).AddTicks(2710), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 12, 54, 45, 242, DateTimeKind.Unspecified).AddTicks(2752), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 12, 54, 45, 242, DateTimeKind.Unspecified).AddTicks(2757), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 12, 54, 45, 242, DateTimeKind.Unspecified).AddTicks(2764), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 100,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 30, 12, 54, 45, 242, DateTimeKind.Unspecified).AddTicks(2780), new TimeSpan(0, 3, 0, 0, 0)));
        }
    }
}
