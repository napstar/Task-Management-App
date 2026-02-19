using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SwmcolTaskTracker.Shared.Models
{
    public class Project
    {
        [Key]
        public int ProjectId { get; set; }

        [Required]
        [MaxLength(100)]
        public string ProjectName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(100)]
        public string? ProjectLeadAdOid { get; set; }

        [Column("project_Owner")]
        [MaxLength(100)]
        public string? ProjectOwnerId { get; set; }

        [Column("project_Owner_Email")]
        [MaxLength(200)]
        public string? ProjectOwnerEmail { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
