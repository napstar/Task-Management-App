using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SwmcolTaskTracker.Shared.Models
{
    [Table("TaskDependencies")]
    public class TaskDependency
    {
        [Key]
        public int DependencyId { get; set; }

        public int TaskId { get; set; }

        [Required]
        public Guid User_AD_OID { get; set; }

        [MaxLength(200)]
        public string? User_DisplayName { get; set; }

        [MaxLength(200)]
        public string? User_Email { get; set; }

        // Navigation Property
        [ForeignKey(nameof(TaskId))]
        public TaskItem? Task { get; set; }
    }
}
