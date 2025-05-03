using Lithuaningo.API.DTOs.Leaderboard;

namespace Lithuaningo.API.Services.Leaderboard
{
    public interface ILeaderboardService
    {
        /// <summary>
        /// Gets the paginated leaderboard entries for the current week
        /// </summary>
        /// <returns>List of leaderboard entries for the current week</returns>
        Task<List<LeaderboardEntryResponse>> GetCurrentWeekLeaderboardAsync();

        /// <summary>
        /// Updates or creates a user's leaderboard entry for the current week
        /// </summary>
        /// <param name="request">The request containing user ID and score to add</param>
        /// <returns>The updated leaderboard entry</returns>
        Task<LeaderboardEntryResponse> UpdateLeaderboardEntryAsync(UpdateLeaderboardEntryRequest request);
    }
}
