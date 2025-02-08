using System;

namespace Lithuaningo.API.DTOs.DeckReport
{
    /// <summary>
    /// Response containing deck report information
    /// </summary>
    public class DeckReportResponse
    {
        /// <summary>
        /// The unique identifier
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The deck identifier
        /// </summary>
        public Guid DeckId { get; set; }

        /// <summary>
        /// The reason for the report
        /// </summary>
        public string Reason { get; set; } = string.Empty;

        /// <summary>
        /// Additional details about the report
        /// </summary>
        public string Details { get; set; } = string.Empty;

        /// <summary>
        /// The user identifier who reported the deck
        /// </summary>
        public Guid ReportedBy { get; set; }

        /// <summary>
        /// The display name of the user who reported the deck
        /// </summary>
        public string ReportedByUserName { get; set; } = string.Empty;

        /// <summary>
        /// Current status of the report (pending/resolved/rejected)
        /// </summary>
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// The user identifier who reviewed the report
        /// </summary>
        public Guid? ReviewedBy { get; set; }

        /// <summary>
        /// The display name of the user who reviewed the report
        /// </summary>
        public string? ReviewedByUserName { get; set; }

        /// <summary>
        /// The resolution details if the report was reviewed
        /// </summary>
        public string? Resolution { get; set; }

        /// <summary>
        /// Human-readable time elapsed since report creation
        /// </summary>
        public string TimeAgo { get; set; } = string.Empty;

        /// <summary>
        /// When this report was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When this report was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
} 