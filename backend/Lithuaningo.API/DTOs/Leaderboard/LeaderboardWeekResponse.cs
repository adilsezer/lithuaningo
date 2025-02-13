using System;
using System.Collections.Generic;

namespace Lithuaningo.API.DTOs.Leaderboard
{
    /// <summary>
    /// Response containing leaderboard information
    /// </summary>
    public class LeaderboardWeekResponse
    {
        /// <summary>
        /// The unique identifier of the leaderboard week
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Start date of the leaderboard period
        /// </summary>
        public DateTime StartDate { get; set; }

        /// <summary>
        /// End date of the leaderboard period
        /// </summary>
        public DateTime EndDate { get; set; }

        /// <summary>
        /// Dictionary of leaderboard entries, keyed by user ID
        /// </summary>
        public Dictionary<string, LeaderboardEntryResponse> Entries { get; set; } = new();
    }
}
