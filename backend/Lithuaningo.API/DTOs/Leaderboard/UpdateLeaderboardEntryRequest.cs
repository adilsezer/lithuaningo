using System;
using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.Leaderboard
{
    /// <summary>
    /// Request to update a leaderboard entry
    /// </summary>
    public class UpdateLeaderboardEntryRequest
    {
        /// <summary>
        /// The user identifier
        /// </summary>
        [Required(ErrorMessage = "User ID is required")]
        public Guid UserId { get; set; }

        /// <summary>
        /// The score to be added to the user's current score
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "Score must be a non-negative number")]
        public int ScoreToAdd { get; set; }
    }
}