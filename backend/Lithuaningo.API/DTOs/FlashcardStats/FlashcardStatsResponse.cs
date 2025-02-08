using System;

namespace Lithuaningo.API.DTOs.FlashcardStats
{
    /// <summary>
    /// Response containing flashcard statistics
    /// </summary>
    public class FlashcardStatsResponse
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
        /// The user identifier
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// Total number of cards reviewed
        /// </summary>
        public int TotalReviewed { get; set; }

        /// <summary>
        /// Number of correct answers
        /// </summary>
        public int CorrectAnswers { get; set; }

        /// <summary>
        /// Accuracy rate (0-100)
        /// </summary>
        public double AccuracyRate { get; set; }

        /// <summary>
        /// When these stats were last updated
        /// </summary>
        public DateTime LastReviewedAt { get; set; }

        /// <summary>
        /// Human-readable time since last review
        /// </summary>
        public string LastReviewedTimeAgo { get; set; } = string.Empty;

        /// <summary>
        /// Human-readable time until next review
        /// </summary>
        public string? NextReviewDue { get; set; }

        /// <summary>
        /// When these stats were created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When these stats were last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
} 