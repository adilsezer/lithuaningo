using System;

namespace Lithuaningo.API.DTOs.Announcement
{
    /// <summary>
    /// Response containing announcement information
    /// </summary>
    public class AnnouncementResponse
    {
        /// <summary>
        /// The unique identifier of the announcement
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The announcement title
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// The announcement content
        /// </summary>
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// Whether the announcement is currently active
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// When the announcement expires
        /// </summary>
        public DateTime? ValidUntil { get; set; }

        /// <summary>
        /// When the announcement was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When the announcement was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
} 