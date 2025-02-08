using System;

namespace Lithuaningo.API.DTOs.Announcement
{
    /// <summary>
    /// Response containing announcement information
    /// </summary>
    public class AnnouncementResponse
    {
        /// <summary>
        /// The unique identifier
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
        /// Human-readable time remaining until expiry
        /// </summary>
        public string? TimeRemaining { get; set; }

        /// <summary>
        /// Current status of the announcement (active/inactive/expired)
        /// </summary>
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// When this announcement was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When this announcement was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
} 