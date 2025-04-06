using Lithuaningo.API.DTOs.UserChallengeStats;

namespace Lithuaningo.API.Services.Stats
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
        /// Submits a challenge answer and automatically updates all relevant user statistics.
        /// </summary>
        /// <param name="userId">The ID of the user submitting the answer.</param>
        /// <param name="request">The challenge answer details.</param>
        /// <returns>The updated user challenge statistics.</returns>
        Task<UserChallengeStatsResponse> SubmitChallengeAnswerAsync(string userId, SubmitChallengeAnswerRequest request);
    }
}