using Lithuaningo.API.Models;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IChallengeStatsService
    {
        /// <summary>
        /// Retrieves challenge statistics for the specified user.
        /// </summary>
        /// <param name="userId">The ID of the user to get stats for.</param>
        /// <returns>Challenge statistics for the specified user.</returns>
        Task<ChallengeStats> GetChallengeStatsAsync(string userId);

        /// <summary>
        /// Updates the challenge statistics for a user.
        /// </summary>
        /// <param name="challengeStats">The updated challenge statistics.</param>
        Task UpdateChallengeStatsAsync(ChallengeStats challengeStats);

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
        /// Increments the total number of quizzes completed by the user.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        Task IncrementTotalQuizzesCompletedAsync(string userId);
    }
} 