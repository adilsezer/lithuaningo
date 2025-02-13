using System.Threading.Tasks;
using Lithuaningo.API.DTOs.Leaderboard;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface ILeaderboardService
    {
        /// <summary>
        /// Gets the leaderboard for the current week
        /// </summary>
        /// <returns>The current week's leaderboard with Guid identifier</returns>
        Task<LeaderboardWeekResponse> GetCurrentWeekLeaderboardAsync();

        /// <summary>
        /// Gets the leaderboard for a specific week
        /// </summary>
        /// <param name="weekId">The week identifier in YYYY-WW format (e.g., "2024-12")</param>
        /// <returns>The specified week's leaderboard with Guid identifier</returns>
        Task<LeaderboardWeekResponse> GetWeekLeaderboardAsync(string weekId);

        /// <summary>
        /// Updates a user's leaderboard entry
        /// </summary>
        /// <param name="userId">The user's Guid identifier</param>
        /// <param name="score">The user's score</param>
        /// <returns>The updated leaderboard entry</returns>
        Task<LeaderboardEntryResponse> UpdateLeaderboardEntryAsync(string userId, int score);
    }
}
