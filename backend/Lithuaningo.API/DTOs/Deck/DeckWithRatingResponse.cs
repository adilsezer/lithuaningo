using System;

namespace Lithuaningo.API.DTOs.Deck
{
    /// <summary>
    /// Response containing deck information with rating
    /// </summary>
    public class DeckWithRatingResponse : DeckResponse
    {
        /// <summary>
        /// The deck's rating based on votes (0.0 to 1.0)
        /// </summary>
        public double Rating { get; set; }

        /// <summary>
        /// Total number of votes for this deck
        /// </summary>
        public int TotalVotes { get; set; }

        /// <summary>
        /// Number of upvotes for this deck
        /// </summary>
        public int UpvoteCount { get; set; }
    }
} 