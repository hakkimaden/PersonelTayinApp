using System;
using System.ComponentModel.DataAnnotations;

namespace TayinAspApi.Models
{
    public class AppLog
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        [Required]
        [StringLength(50)]
        public string LogLevel { get; set; } = null!;
        [Required]
        public string Message { get; set; } = null!;
        [StringLength(255)]
        public string? Username { get; set; }
        [StringLength(255)]
        public string? Action { get; set; }
        public string? Details { get; set; }
    }
}