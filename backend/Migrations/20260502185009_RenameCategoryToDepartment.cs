using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aabu_project.Migrations
{
    public partial class RenameCategoryToDepartment : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Rename Categories table to Departments
            migrationBuilder.RenameTable(
                name: "Categories",
                newName: "Departments");

            // Rename CategoryId column in Jobs table to DepartmentId
            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "Jobs",
                newName: "DepartmentId");

            // Rename Index
            migrationBuilder.RenameIndex(
                name: "IX_Jobs_CategoryId",
                table: "Jobs",
                newName: "IX_Jobs_DepartmentId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "Departments",
                newName: "Categories");

            migrationBuilder.RenameColumn(
                name: "DepartmentId",
                table: "Jobs",
                newName: "CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_Jobs_DepartmentId",
                table: "Jobs",
                newName: "IX_Jobs_CategoryId");
        }
    }
}
