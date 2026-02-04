using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SwmcolTaskTracker.Shared.Models
{
    [Table("Tasks")]
    public class TaskItem
    {
        [Key]
        public int TaskId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "ToDo";

        [MaxLength(100)]
        public string? ProjectName { get; set; }

        [Required]
        public Guid CreatedBy_AD_OID { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? DueDate { get; set; }

        public DateTime? CompletedDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("ProjectID")]
        public int? ProjectId { get; set; }

        // Navigation Properties
        public ICollection<TaskDependency> Dependencies { get; set; } = new List<TaskDependency>();
        public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
    }
}
