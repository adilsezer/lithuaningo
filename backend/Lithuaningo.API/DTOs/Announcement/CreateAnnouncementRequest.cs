using System;
using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.Announcement
{
    /// <summary>
    /// Request to create a new announcement
    /// </summary>
    public class CreateAnnouncementRequest
    {
        /// <summary>
        /// The announcement title
        /// </summary>
        [Required(ErrorMessage = "Title is required")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "Title must be between 1 and 200 characters")]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// The announcement content
        /// </summary>
        [Required(ErrorMessage = "Content is required")]
        [StringLength(2000, MinimumLength = 1, ErrorMessage = "Content must be between 1 and 2000 characters")]
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// Whether the announcement is active
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Optional expiry date for the announcement
        /// </summary>
        [DataType(DataType.DateTime)]
        public DateTime? ValidUntil { get; set; }
    }
} 