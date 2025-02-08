using System;
using System.Collections.Generic;

namespace Lithuaningo.API.DTOs.Leaderboard
{
    /// <summary>
    /// Response containing leaderboard information
    /// </summary>
    public class LeaderboardResponse
    {
        /// <summary>
        /// The week identifier (YYYY-WW format)
        /// </summary>
        public string WeekId { get; set; } = string.Empty;

        /// <summary>
        /// Start date of the leaderboard period
        /// </summary>
        public DateTime StartDate { get; set; }

        /// <summary>
        /// End date of the leaderboard period
        /// </summary>
        public DateTime EndDate { get; set; }

        /// <summary>
        /// List of leaderboard entries
        /// </summary>
        public List<LeaderboardEntryResponse> Entries { get; set; } = new();
    }

    /// <summary>
    /// Response containing leaderboard entry information
    /// </summary>
    public class LeaderboardEntryResponse
    {
        /// <summary>
        /// The user identifier
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// The display name of the user
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// The user's score
        /// </summary>
        public int Score { get; set; }

        /// <summary>
        /// The user's rank on the leaderboard
        /// </summary>
        public int Rank { get; set; }

        /// <summary>
        /// Human-readable time since last update
        /// </summary>
        public string LastUpdatedTimeAgo { get; set; } = string.Empty;

        /// <summary>
        /// When this entry was last updated
        /// </summary>
        public DateTime LastUpdated { get; set; }
    }
} 