using System;

namespace Lithuaningo.API.Utils
{
    /// <summary>
    /// Utility class for spaced repetition calculations
    /// </summary>
    public static class SpacedRepetitionUtils
    {
        /// <summary>
        /// Calculates the number of days until the next review based on spaced repetition principles
        /// </summary>
        /// <param name="totalReviewed">Number of times the item has been reviewed</param>
        /// <param name="wasCorrect">Whether the answer was correct</param>
        /// <param name="confidenceLevel">User's confidence level (1-5)</param>
        /// <returns>Number of days until the next review</returns>
        public static int CalculateDaysUntilNextReview(int totalReviewed, bool wasCorrect, int confidenceLevel)
        {
            // Simple spaced repetition algorithm:
            // - If answer was incorrect, review again soon (1-2 days)
            // - If answer was correct, increase interval based on confidence and previous reviews
            
            if (!wasCorrect)
            {
                return 1; // Review again tomorrow if incorrect
            }
            
            // Base interval depends on confidence level (1-5)
            int baseInterval = confidenceLevel;
            
            // Multiply by a factor based on how many times it's been reviewed
            double reviewFactor = Math.Min(totalReviewed, 10) / 2.0; // Cap at 5x multiplier
            
            // Calculate days until next review
            int daysUntil = (int)Math.Ceiling(baseInterval * (1 + reviewFactor));
            
            // Cap at 60 days maximum
            return Math.Min(daysUntil, 60);
        }

        /// <summary>
        /// Calculates the next review date based on spaced repetition principles
        /// </summary>
        /// <param name="totalReviewed">Number of times the item has been reviewed</param>
        /// <param name="wasCorrect">Whether the answer was correct</param>
        /// <param name="confidenceLevel">User's confidence level (1-5)</param>
        /// <returns>The next review date</returns>
        public static DateTime CalculateNextReviewDate(int totalReviewed, bool wasCorrect, int confidenceLevel)
        {
            int daysUntil = CalculateDaysUntilNextReview(totalReviewed, wasCorrect, confidenceLevel);
            return DateTime.UtcNow.AddDays(daysUntil);
        }
    }
} 