using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CleanCheck.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTimeTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeSpan>(
                name: "EndTime",
                table: "ServiceTasks",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<string>(
                name: "EntryStatus",
                table: "ServiceTasks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EntryTime",
                table: "ServiceTasks",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExitStatus",
                table: "ServiceTasks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExitTime",
                table: "ServiceTasks",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "StartTime",
                table: "ServiceTasks",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "ServiceTasks");

            migrationBuilder.DropColumn(
                name: "EntryStatus",
                table: "ServiceTasks");

            migrationBuilder.DropColumn(
                name: "EntryTime",
                table: "ServiceTasks");

            migrationBuilder.DropColumn(
                name: "ExitStatus",
                table: "ServiceTasks");

            migrationBuilder.DropColumn(
                name: "ExitTime",
                table: "ServiceTasks");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "ServiceTasks");
        }
    }
}
