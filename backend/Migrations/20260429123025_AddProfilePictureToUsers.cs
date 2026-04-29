using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aabu_project.Migrations
{
    /// <inheritdoc />
    public partial class AddProfilePictureToUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfilePicture",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 1,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 29, 15, 30, 24, 981, DateTimeKind.Unspecified).AddTicks(503), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 2,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 29, 15, 30, 24, 981, DateTimeKind.Unspecified).AddTicks(513), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 3,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 29, 15, 30, 24, 981, DateTimeKind.Unspecified).AddTicks(517), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 4,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 29, 15, 30, 24, 981, DateTimeKind.Unspecified).AddTicks(521), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 5,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 29, 15, 30, 24, 981, DateTimeKind.Unspecified).AddTicks(524), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 6,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 29, 15, 30, 24, 981, DateTimeKind.Unspecified).AddTicks(527), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 29, 15, 0, 24, 981, DateTimeKind.Unspecified).AddTicks(716), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 29, 13, 30, 24, 981, DateTimeKind.Unspecified).AddTicks(735), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 28, 15, 30, 24, 981, DateTimeKind.Unspecified).AddTicks(740), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 26, 15, 30, 24, 981, DateTimeKind.Unspecified).AddTicks(744), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "ProfilePicture" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 29, 15, 30, 24, 981, DateTimeKind.Unspecified).AddTicks(354), new TimeSpan(0, 3, 0, 0, 0)), null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "ProfilePicture" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 29, 15, 30, 24, 981, DateTimeKind.Unspecified).AddTicks(396), new TimeSpan(0, 3, 0, 0, 0)), null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "ProfilePicture" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 29, 15, 30, 24, 981, DateTimeKind.Unspecified).AddTicks(400), new TimeSpan(0, 3, 0, 0, 0)), null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedAt", "ProfilePicture" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 29, 15, 30, 24, 981, DateTimeKind.Unspecified).AddTicks(403), new TimeSpan(0, 3, 0, 0, 0)), null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 100,
                columns: new[] { "CreatedAt", "ProfilePicture" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 29, 15, 30, 24, 981, DateTimeKind.Unspecified).AddTicks(406), new TimeSpan(0, 3, 0, 0, 0)), null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfilePicture",
                table: "Users");

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 1,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(5001), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 2,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(5012), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 3,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(5017), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 4,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(5021), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 5,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(5026), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 6,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(5030), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 24, 16, 41, 48, 510, DateTimeKind.Unspecified).AddTicks(5933), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 24, 15, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(5955), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(5963), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 21, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(5970), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(4864), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(4919), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(4924), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(4928), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 100,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(4931), new TimeSpan(0, 3, 0, 0, 0)));
        }
    }
}
