using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CleanCheck.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDateAndLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "ServiceTasks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledDate",
                table: "ServiceTasks",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Location",
                table: "ServiceTasks");

            migrationBuilder.DropColumn(
                name: "ScheduledDate",
                table: "ServiceTasks");
        }
    }
}
