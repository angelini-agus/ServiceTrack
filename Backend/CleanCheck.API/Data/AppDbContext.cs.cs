using Microsoft.EntityFrameworkCore;
using CleanCheck.API.Models;

namespace CleanCheck.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<ServiceTask> ServiceTasks { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<SupplyRequest> SupplyRequests { get; set; }
    public DbSet<Consortium> Consortiums { get; set; }
    public DbSet<WeeklySchedule> WeeklySchedules { get; set; }
    public DbSet<AttendanceLog> AttendanceLogs { get; set; }
}