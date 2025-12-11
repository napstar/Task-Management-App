using Microsoft.EntityFrameworkCore;
using SwmcolTaskTracker.API.Models;

namespace SwmcolTaskTracker.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<TaskItem> Tasks { get; set; }
        public DbSet<TaskDependency> TaskDependencies { get; set; }
        public DbSet<TaskComment> TaskComments { get; set; }
        public DbSet<Project> Projects { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Optional: Configure specific relationships or constraints if needed
            // e.g. modelBuilder.Entity<TaskItem>().HasMany(t => t.Comments)... 
            // but [ForeignKey] attributes in models act as sufficient default for now.
        }
    }
}
