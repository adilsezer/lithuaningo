using System;

namespace Lithuaningo.API.DTOs.Leaderboard
{
    /// <summary>
    /// Response containing leaderboard entry information
    /// </summary>
    public class LeaderboardEntryResponse
    {
        /// <summary>
        /// The unique identifier for the entry
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The user identifier
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// The user's username from their profile
        /// </summary>
        public string Username { get; set; } = string.Empty;

        /// <summary>
        /// The user's score
        /// </summary>
        public int Score { get; set; }

        /// <summary>
        /// The week identifier in YYYY-WW format
        /// </summary>
        public string WeekId { get; set; } = string.Empty;

        /// <summary>
        /// When the entry was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When the entry was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
} 