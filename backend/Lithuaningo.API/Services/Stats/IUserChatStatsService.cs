using Lithuaningo.API.DTOs.UserChatStats;

namespace Lithuaningo.API.Services.Stats
{
    /// <summary>
    /// Service for managing user chat statistics
    /// </summary>
    public interface IUserChatStatsService
    {
        /// <summary>
        /// Gets chat statistics for the specified user
        /// </summary>
        /// <param name="userId">The ID of the user to get stats for</param>
        /// <returns>Chat statistics for the specified user</returns>
        Task<UserChatStatsResponse> GetUserChatStatsAsync(string userId);

        /// <summary>
        /// Tracks a message sent by the user
        /// </summary>
        /// <param name="userId">The ID of the user sending the message</param>
        /// <param name="request">Optional tracking details</param>
        /// <returns>The updated user chat statistics</returns>
        Task<UserChatStatsResponse> TrackMessageAsync(string userId, TrackMessageRequest? request = null);

        /// <summary>
        /// Checks if a user has reached their daily message limit
        /// </summary>
        /// <param name="userId">The ID of the user to check</param>
        /// <param name="isPremium">Whether the user has premium status</param>
        /// <returns>True if the user has reached their limit, false otherwise</returns>
        Task<bool> HasReachedDailyLimitAsync(string userId, bool isPremium);
    }
}