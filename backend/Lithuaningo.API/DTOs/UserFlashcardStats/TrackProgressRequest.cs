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
        [Required(ErrorMessage = "IsCorrect flag is required")]
        public bool IsCorrect { get; set; }

        /// <summary>
        /// Optional confidence level (1-5) for spaced repetition
        /// </summary>
        [Range(1, 5, ErrorMessage = "Confidence level must be between 1 and 5")]
        public int? ConfidenceLevel { get; set; }

        /// <summary>
        /// Time taken to answer in seconds
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "Time taken must be non-negative")]
        public int TimeTakenSeconds { get; set; }
    }
} 