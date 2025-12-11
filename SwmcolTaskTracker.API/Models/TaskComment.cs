using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SwmcolTaskTracker.API.Models
{
    [Table("TaskComments")]
    public class TaskComment
    {
        [Key]
        public int CommentId { get; set; }

        public int TaskId { get; set; }

        [Required]
        public string CommentText { get; set; } = string.Empty;

        [Required]
        public Guid Author_AD_OID { get; set; }

        public DateTime CreatedTimestamp { get; set; } = DateTime.UtcNow;

        // Navigation Property
        [ForeignKey(nameof(TaskId))]
        public TaskItem? Task { get; set; }
    }
}
