using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CleanCheck.API.Migrations
{
    /// <inheritdoc />
    public partial class AddGeoLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "ServiceTasks",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "ServiceTasks",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "ServiceTasks");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "ServiceTasks");
        }
    }
}
