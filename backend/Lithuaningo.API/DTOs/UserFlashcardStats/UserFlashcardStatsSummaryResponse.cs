using System;
using System.Collections.Generic;

namespace Lithuaningo.API.DTOs.UserFlashcardStats
{
    /// <summary>
    /// Represents a summary of a user's flashcard statistics
    /// </summary>
    public class UserFlashcardStatsSummaryResponse
    {
        /// <summary>
        /// The ID of the user
        /// </summary>
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// Total number of flashcards the user has interacted with
        /// </summary>
        public int TotalFlashcards { get; set; }

        /// <summary>
        /// Total number of times the user has viewed flashcards
        /// </summary>
        public int TotalViews { get; set; }

        /// <summary>
        /// Total number of correct answers
        /// </summary>
        public int TotalCorrectAnswers { get; set; }

        /// <summary>
        /// Total number of incorrect answers
        /// </summary>
        public int TotalIncorrectAnswers { get; set; }

        /// <summary>
        /// Average mastery level across all flashcards
        /// </summary>
        public double AverageMasteryLevel { get; set; }

        /// <summary>
        /// Number of flashcards viewed today (based on distinct flashcard_ids with updated_at timestamp for today)
        /// </summary>
        public int FlashcardsViewedToday { get; set; }

        /// <summary>
        /// Success rate (correct answers / total answers)
        /// </summary>
        public double SuccessRate => TotalViews > 0 ? (double)TotalCorrectAnswers / TotalViews * 100 : 0;
    }
}