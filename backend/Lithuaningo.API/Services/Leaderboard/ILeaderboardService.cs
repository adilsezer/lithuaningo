using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.Leaderboard;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface ILeaderboardService
    {
        /// <summary>
        /// Gets the paginated leaderboard entries for the current week
        /// </summary>
        /// <returns>List of leaderboard entries for the current week</returns>
        Task<List<LeaderboardEntryResponse>> GetCurrentWeekLeaderboardAsync();

        /// <summary>
        /// Gets the paginated leaderboard entries for a specific week
        /// </summary>
        /// <param name="weekId">The week identifier in YYYY-WW format</param>
        /// <returns>List of leaderboard entries for the specified week</returns>
        Task<List<LeaderboardEntryResponse>> GetWeekLeaderboardAsync(string weekId);

        /// <summary>
        /// Updates or creates a user's leaderboard entry for the current week
        /// </summary>
        /// <param name="userId">The user's Guid identifier</param>
        /// <param name="score">The score to update</param>
        /// <returns>The updated leaderboard entry</returns>
        Task<LeaderboardEntryResponse> UpdateLeaderboardEntryAsync(string userId, int score);
    }
}
