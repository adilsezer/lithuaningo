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
        /// The week identifier (YYYY-WW format)
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
        /// List of leaderboard entries
        /// </summary>
        public List<LeaderboardEntryResponse> Entries { get; set; } = new();
    }
}
