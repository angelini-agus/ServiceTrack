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
}