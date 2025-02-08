using System;
using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.Announcement
{
    public class CreateAnnouncementRequest
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "Title must be between 1 and 200 characters")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Content is required")]
        [StringLength(2000, MinimumLength = 1, ErrorMessage = "Content must be between 1 and 2000 characters")]
        public string Content { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime? ValidUntil { get; set; }
    }
} 