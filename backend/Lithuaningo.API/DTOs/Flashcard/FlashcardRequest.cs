using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.Flashcard
{
    /// <summary>
    /// Difficulty levels for flashcards
    /// </summary>
    public enum DifficultyLevel
    {
        /// <summary>
        /// Basic vocabulary and grammar
        /// </summary>
        Basic = 0,
        
        /// <summary>
        /// Intermediate vocabulary and grammar
        /// </summary>
        Intermediate = 1,
        
        /// <summary>
        /// Advanced vocabulary and grammar
        /// </summary>
        Advanced = 2
    }

    /// <summary>
    /// Request for flashcard operations (generation and retrieval)
    /// </summary>
    public class FlashcardRequest
    {
        /// <summary>
        /// The topic to get flashcards for
        /// </summary>
        [Required]
        [StringLength(100)]
        public string Topic { get; set; } = string.Empty;

        /// <summary>
        /// Number of flashcards to return (1-50)
        /// </summary>
        [Range(1, 50)]
        public int Count { get; set; } = 10;

        /// <summary>
        /// Optional user ID for development/testing. If not provided, uses the authenticated user's ID.
        /// </summary>
        public string? UserId { get; set; }
        
        /// <summary>
        /// The difficulty level of flashcards to generate
        /// </summary>
        public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Basic;
    }
} 