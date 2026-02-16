using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwmcolTaskTracker.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProjectModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            /*
            migrationBuilder.AddColumn<int>(
                name: "ProjectID",
                table: "Tasks",
                type: "int",
                nullable: true);
            */

            /*
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Projects",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
            */

            /*
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Projects",
                type: "bit",
                nullable: false,
                defaultValue: false);
            */

            migrationBuilder.AddColumn<string>(
                name: "ProjectLeadAdOid",
                table: "Projects",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProjectID",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "ProjectLeadAdOid",
                table: "Projects");
        }
    }
}
