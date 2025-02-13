using System;

namespace Lithuaningo.API.DTOs.DeckReport
{
    /// <summary>
    /// Response containing deck report information
    /// </summary>
    public class DeckReportResponse
    {
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
        /// Current status of the report (pending/resolved/rejected)
        /// </summary>
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// The resolution details if the report was reviewed
        /// </summary>
        public string Resolution { get; set; } = string.Empty;

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