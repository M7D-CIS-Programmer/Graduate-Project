using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aabu_project.Migrations
{
    /// <inheritdoc />
    public partial class AddUserOwnershipToCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Add CreatedAt — not null with a SQL default so existing rows get the current time
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedAt",
                table: "Categories",
                type: "datetimeoffset",
                nullable: false,
                defaultValueSql: "GETUTCDATE()");

            // 2. Add UserId — nullable so existing global categories keep UserId = NULL
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Categories",
                type: "int",
                nullable: true);

            // 3. Index on UserId for fast per-company queries
            migrationBuilder.CreateIndex(
                name: "IX_Categories_UserId",
                table: "Categories",
                column: "UserId");

            // 4. FK: Categories.UserId → Users.Id  (SetNull so deleting a user doesn't cascade)
            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Users_UserId",
                table: "Categories",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            // 5. Backfill CreatedAt for the 5 seeded global categories
            var seedDate = new DateTimeOffset(2024, 1, 1, 0, 0, 0, TimeSpan.Zero);
            foreach (var id in new[] { 1, 2, 3, 4, 5 })
            {
                migrationBuilder.UpdateData(
                    table: "Categories",
                    keyColumn: "Id",
                    keyValue: id,
                    column: "CreatedAt",
                    value: seedDate);
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Users_UserId",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_UserId",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Categories");
        }
    }
}
