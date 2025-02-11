using System.ComponentModel.DataAnnotations;
using Lithuaningo.API.Validators;

namespace Lithuaningo.API.DTOs.UserFlashcardStats
{
    /// <summary>
    /// Request to track progress for a flashcard
    /// </summary>
    public class TrackProgressRequest
    {
        /// <summary>
        /// The flashcard identifier
        /// </summary>
        [Required(ErrorMessage = "Flashcard ID is required")]
        [ValidGuid(ErrorMessage = "Invalid Flashcard ID format")]
        public string FlashcardId { get; set; } = string.Empty;

        /// <summary>
        /// Whether the answer was correct
        /// </summary>
        [Required]
        public bool IsCorrect { get; set; }
    }
} 