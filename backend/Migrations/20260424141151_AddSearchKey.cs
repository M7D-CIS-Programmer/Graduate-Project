using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace aabu_project.Migrations
{
    /// <inheritdoc />
    public partial class AddSearchKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.AddColumn<string>(
                name: "SearchKey",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SearchKey",
                table: "Jobs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Company", "PostedDate", "SearchKey" },
                values: new object[] { "Dubai Tech Solutions", new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(5001), new TimeSpan(0, 3, 0, 0, 0)), null });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Company", "PostedDate", "SearchKey" },
                values: new object[] { "Creative Studio UAE", new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(5012), new TimeSpan(0, 3, 0, 0, 0)), null });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "PostedDate", "SearchKey" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(5017), new TimeSpan(0, 3, 0, 0, 0)), null });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "PostedDate", "SearchKey", "UserId" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(5021), new TimeSpan(0, 3, 0, 0, 0)), null, 3 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "PostedDate", "SearchKey", "UserId" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(5026), new TimeSpan(0, 3, 0, 0, 0)), null, 3 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Company", "PostedDate", "SearchKey", "UserId" },
                values: new object[] { "App Builders", new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(5030), new TimeSpan(0, 3, 0, 0, 0)), null, 3 });

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
                columns: new[] { "CreatedAt", "SearchKey" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(4864), new TimeSpan(0, 3, 0, 0, 0)), null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "SearchKey" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(4919), new TimeSpan(0, 3, 0, 0, 0)), null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "SearchKey" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(4924), new TimeSpan(0, 3, 0, 0, 0)), null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedAt", "SearchKey" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(4928), new TimeSpan(0, 3, 0, 0, 0)), null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 100,
                columns: new[] { "CreatedAt", "SearchKey" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 24, 17, 11, 48, 510, DateTimeKind.Unspecified).AddTicks(4931), new TimeSpan(0, 3, 0, 0, 0)), null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SearchKey",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SearchKey",
                table: "Jobs");

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Company", "PostedDate" },
                values: new object[] { "Tech Corp", new DateTimeOffset(new DateTime(2026, 4, 23, 2, 44, 41, 706, DateTimeKind.Unspecified).AddTicks(2062), new TimeSpan(0, 3, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Company", "PostedDate" },
                values: new object[] { "Tech Corp", new DateTimeOffset(new DateTime(2026, 4, 23, 2, 44, 41, 706, DateTimeKind.Unspecified).AddTicks(2088), new TimeSpan(0, 3, 0, 0, 0)) });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 3,
                column: "PostedDate",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 44, 41, 706, DateTimeKind.Unspecified).AddTicks(2095), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "PostedDate", "UserId" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 23, 2, 44, 41, 706, DateTimeKind.Unspecified).AddTicks(2100), new TimeSpan(0, 3, 0, 0, 0)), 5 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "PostedDate", "UserId" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 4, 23, 2, 44, 41, 706, DateTimeKind.Unspecified).AddTicks(2105), new TimeSpan(0, 3, 0, 0, 0)), 6 });

            migrationBuilder.UpdateData(
                table: "Jobs",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Company", "PostedDate", "UserId" },
                values: new object[] { "Health Plus", new DateTimeOffset(new DateTime(2026, 4, 23, 2, 44, 41, 706, DateTimeKind.Unspecified).AddTicks(2110), new TimeSpan(0, 3, 0, 0, 0)), 7 });

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 14, 41, 706, DateTimeKind.Unspecified).AddTicks(2302), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 0, 44, 41, 706, DateTimeKind.Unspecified).AddTicks(2321), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 22, 2, 44, 41, 706, DateTimeKind.Unspecified).AddTicks(2327), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Notifications",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 20, 2, 44, 41, 706, DateTimeKind.Unspecified).AddTicks(2333), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 44, 41, 706, DateTimeKind.Unspecified).AddTicks(1908), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 44, 41, 706, DateTimeKind.Unspecified).AddTicks(1952), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 44, 41, 706, DateTimeKind.Unspecified).AddTicks(1956), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 44, 41, 706, DateTimeKind.Unspecified).AddTicks(1961), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 100,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 23, 2, 44, 41, 706, DateTimeKind.Unspecified).AddTicks(1981), new TimeSpan(0, 3, 0, 0, 0)));

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Description", "Email", "Github", "Industry", "LinkedIn", "Location", "Name", "Pass", "Phone", "Status", "Website" },
                values: new object[,]
                {
                    { 5, new DateTimeOffset(new DateTime(2026, 4, 23, 2, 44, 41, 706, DateTimeKind.Unspecified).AddTicks(1966), new TimeSpan(0, 3, 0, 0, 0)), "A full-service digital marketing agency helping brands grow.", "contact@growth.com", null, "Marketing", null, "Sharjah, UAE", "Growth Agency", "password", null, "Active", "growth.com" },
                    { 6, new DateTimeOffset(new DateTime(2026, 4, 23, 2, 44, 41, 706, DateTimeKind.Unspecified).AddTicks(1970), new TimeSpan(0, 3, 0, 0, 0)), "Global financial services firm with a focus on investment banking.", "jobs@financeglobal.com", null, "Finance", null, "Dubai, UAE", "Finance Global", "password", null, "Active", "financeglobal.com" },
                    { 7, new DateTimeOffset(new DateTime(2026, 4, 23, 2, 44, 41, 706, DateTimeKind.Unspecified).AddTicks(1974), new TimeSpan(0, 3, 0, 0, 0)), "Premium healthcare provider with state-of-the-art facilities.", "careers@healthplus.com", null, "Healthcare", null, "Abu Dhabi, UAE", "Health Plus", "password", null, "Active", "healthplus.com" }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "RoleName", "UserId" },
                values: new object[,]
                {
                    { 5, "Employer", 5 },
                    { 6, "Employer", 6 },
                    { 7, "Employer", 7 }
                });
        }
    }
}
