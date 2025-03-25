using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.Flashcard
{
    /// <summary>
    /// Request for generating flashcards using AI
    /// </summary>
    public class CreateFlashcardRequest
    {
        /// <summary>
        /// Description of what kind of flashcards to generate (can include topic, difficulty level, language level, and category)
        /// </summary>
        [Required]
        [StringLength(500, MinimumLength = 2)]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Number of flashcards to generate (1-10)
        /// </summary>
        [Range(1, 10)]
        public int Count { get; set; } = 5;
    }
} 