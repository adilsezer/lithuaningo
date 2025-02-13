using System;

namespace Lithuaningo.API.DTOs.UserFlashcardStats
{
    /// <summary>
    /// Response containing flashcard statistics
    /// </summary>
    public class UserFlashcardStatsResponse
    {
        /// <summary>
        /// The unique identifier
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The user identifier
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// The flashcard identifier
        /// </summary>
        public Guid FlashcardId { get; set; }

        /// <summary>
        /// Accuracy rate (0-100)
        /// </summary>
        public double AccuracyRate { get; set; }

        /// <summary>
        /// Total number of cards reviewed
        /// </summary>
        public int TotalReviewed { get; set; }

        /// <summary>
        /// Number of correct answers
        /// </summary>
        public int CorrectAnswers { get; set; }

        /// <summary>
        /// When these stats were last updated
        /// </summary>
        public DateTime LastReviewedAt { get; set; }

        /// <summary>
        /// Human-readable time until next review
        /// </summary>
        public string? NextReviewDue { get; set; }
    }
} 