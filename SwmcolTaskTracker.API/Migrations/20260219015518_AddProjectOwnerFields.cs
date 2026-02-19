using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwmcolTaskTracker.API.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectOwnerFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "project_Owner",
                table: "Projects",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "project_Owner_Email",
                table: "Projects",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "project_Owner",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "project_Owner_Email",
                table: "Projects");
        }
    }
}
