using System;

namespace Lithuaningo.API.DTOs.Announcement
{
    /// <summary>
    /// Response containing announcement information
    /// </summary>
    public class AnnouncementResponse
    {
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
    }
} 