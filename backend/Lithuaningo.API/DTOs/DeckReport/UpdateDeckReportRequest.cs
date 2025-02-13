using System;
using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.DeckReport
{
    /// <summary>
    /// Request to update an existing deck report
    /// </summary>
    public class UpdateDeckReportRequest
    {
        /// <summary>
        /// Current status of the report (pending/resolved/rejected)
        /// </summary>
        [Required(ErrorMessage = "Status is required")]
        [RegularExpression("^(pending|resolved|rejected)$", ErrorMessage = "Status must be either 'pending', 'resolved', or 'rejected'")]
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// The user identifier who reviewed the report
        /// </summary>
        [Required(ErrorMessage = "Reviewer ID is required")]
        public Guid ReviewerId { get; set; }

        /// <summary>
        /// The resolution details
        /// </summary>
        [Required(ErrorMessage = "Resolution is required")]
        [StringLength(1000, MinimumLength = 1, ErrorMessage = "Resolution must be between 1 and 1000 characters")]
        public string Resolution { get; set; } = string.Empty;
    }
}
