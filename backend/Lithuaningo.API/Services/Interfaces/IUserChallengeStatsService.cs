using System.Threading.Tasks;
using Lithuaningo.API.DTOs.UserChallengeStats;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IUserChallengeStatsService
    {
        /// <summary>
        /// Retrieves challenge statistics for the specified user.
        /// </summary>
        /// <param name="userId">The ID of the user to get stats for.</param>
        /// <returns>Challenge statistics for the specified user.</returns>
        Task<UserChallengeStatsResponse> GetUserChallengeStatsAsync(string userId);

        /// <summary>
        /// Updates the challenge statistics for a user.
        /// </summary>
        /// <param name="userId">The ID of the user to update stats for.</param>
        /// <param name="request">The updated user challenge statistics.</param>
        Task UpdateUserChallengeStatsAsync(string userId, UpdateUserChallengeStatsRequest request);

        /// <summary>
        /// Updates the daily streak for a user based on their last activity.
        /// </summary>
        /// <param name="userId">The ID of the user to update streak for.</param>
        Task UpdateDailyStreakAsync(string userId);

        /// <summary>
        /// Adds experience points to the user's weekly progress.
        /// </summary>
        /// <param name="userId">The ID of the user to add points for.</param>
        /// <param name="amount">The amount of experience points to add.</param>
        Task AddExperiencePointsAsync(string userId, int amount);

        /// <summary>
        /// Increments the number of mastered cards for a user.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <param name="wordId">The ID of the word that was learned.</param>
        Task AddLearnedWordAsync(string userId, string wordId);

        /// <summary>
        /// Increments the total number of challenges completed by the user.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        Task IncrementTotalChallengesCompletedAsync(string userId);
    }
} 