using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.Flashcard
{
    /// <summary>
    /// Request for generating flashcards using AI
    /// </summary>
    public class CreateFlashcardRequest
    {
        /// <summary>
        /// Topic or category of the flashcards (e.g., "Basic Vocabulary", "Grammar", "Common Phrases")
        /// </summary>
        [Required]
        [StringLength(100)]
        public string Topic { get; set; } = string.Empty;

        /// <summary>
        /// Number of flashcards to generate (1-50)
        /// </summary>
        [Required]
        [Range(1, 50)]
        public int Count { get; set; }

        /// <summary>
        /// ID of the user requesting the flashcards
        /// </summary>
        [Required]
        public string UserId { get; set; } = string.Empty;
    }
} 