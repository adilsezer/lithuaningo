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
        /// Also updates the user's leaderboard entry if there are new correct answers.
        /// </summary>
        /// <param name="userId">The ID of the user to update stats for.</param>
        /// <param name="request">The updated user challenge statistics.</param>
        Task UpdateUserChallengeStatsAsync(string userId, UpdateUserChallengeStatsRequest request);
        
        /// <summary>
        /// Creates challenge statistics for a user.
        /// </summary>
        /// <param name="request">The user challenge statistics to create.</param>
        /// <returns>The created challenge statistics.</returns>
        Task<UserChallengeStatsResponse> CreateUserChallengeStatsAsync(CreateUserChallengeStatsRequest request);
    }
} 