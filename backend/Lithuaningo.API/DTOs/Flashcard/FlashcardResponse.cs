using System;

namespace Lithuaningo.API.DTOs.Flashcard
{
    /// <summary>
    /// Response containing flashcard information
    /// </summary>
    public class FlashcardResponse
    {
        /// <summary>
        /// The unique identifier
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The deck identifier
        /// </summary>
        public Guid DeckId { get; set; }

        /// <summary>
        /// The front text of the flashcard
        /// </summary>
        public string FrontText { get; set; } = string.Empty;

        /// <summary>
        /// The back text of the flashcard
        /// </summary>
        public string BackText { get; set; } = string.Empty;

        /// <summary>
        /// Number of times this card has been reviewed
        /// </summary>
        public int ReviewCount { get; set; }

        /// <summary>
        /// When this card was last reviewed
        /// </summary>
        public DateTime? LastReviewedAt { get; set; }

        /// <summary>
        /// Human-readable time since last review
        /// </summary>
        public string? LastReviewedTimeAgo { get; set; }

        /// <summary>
        /// Percentage of correct answers (0-100)
        /// </summary>
        public double? CorrectRate { get; set; }

        /// <summary>
        /// Human-readable time elapsed since creation
        /// </summary>
        public string TimeAgo { get; set; } = string.Empty;

        /// <summary>
        /// When this flashcard was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When this flashcard was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
} 