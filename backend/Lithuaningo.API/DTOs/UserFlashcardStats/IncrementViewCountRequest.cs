using System;
using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.UserFlashcardStats
{
    /// <summary>
    /// Request to increment the view count for a flashcard.
    /// </summary>
    public class IncrementViewCountRequest
    {
        /// <summary>
        /// The ID of the flashcard whose view count is to be incremented.
        /// </summary>
        [Required]
        public Guid FlashcardId { get; set; }

        /// <summary>
        /// Optional user ID override (primarily for testing/development).
        /// If not provided, the authenticated user's ID will be used.
        /// </summary>
        public string? UserId { get; set; }
    }
}