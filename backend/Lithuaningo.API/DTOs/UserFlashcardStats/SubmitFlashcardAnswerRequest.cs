using System;
using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.UserFlashcardStats
{
    /// <summary>
    /// Request to submit a flashcard answer and update user statistics
    /// </summary>
    public class SubmitFlashcardAnswerRequest
    {
        /// <summary>
        /// The ID of the flashcard being answered
        /// </summary>
        [Required]
        public Guid FlashcardId { get; set; }

        /// <summary>
        /// Whether the answer was correct
        /// </summary>
        [Required]
        public bool WasCorrect { get; set; }

        /// <summary>
        /// Optional user ID override (primarily for testing/development)
        /// </summary>
        public string? UserId { get; set; }
    }
}