using System;
using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.DeckReport
{
    /// <summary>
    /// Request to create a new deck report
    /// </summary>
    public class CreateDeckReportRequest
    {
        /// <summary>
        /// The deck identifier
        /// </summary>
        [Required(ErrorMessage = "Deck ID is required")]
        public Guid DeckId { get; set; }

        /// <summary>
        /// The user identifier who is reporting the deck
        /// </summary>
        [Required(ErrorMessage = "User ID is required")]
        public Guid UserId { get; set; }

        /// <summary>
        /// The reason for the report
        /// </summary>
        [Required(ErrorMessage = "Reason is required")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "Reason must be between 1 and 200 characters")]
        public string Reason { get; set; } = string.Empty;

        /// <summary>
        /// Additional details about the report
        /// </summary>
        [Required(ErrorMessage = "Details are required")]
        [StringLength(1000, MinimumLength = 1, ErrorMessage = "Details must be between 1 and 1000 characters")]
        public string Details { get; set; } = string.Empty;
    }
}
