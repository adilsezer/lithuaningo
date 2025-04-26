using System;

namespace Lithuaningo.API.DTOs.UserChatStats
{
    /// <summary>
    /// Response containing user chat statistics
    /// </summary>
    public class UserChatStatsResponse
    {
        /// <summary>
        /// Date of last chat message
        /// </summary>
        public DateTime LastChatDate { get; set; }

        /// <summary>
        /// Number of messages sent today
        /// </summary>
        public int TodayMessageCount { get; set; }

        /// <summary>
        /// Total number of messages sent all-time
        /// </summary>
        public int TotalMessageCount { get; set; }

        /// <summary>
        /// Maximum number of messages allowed per day for free users
        /// </summary>
        public int MaxFreeMessagesPerDay { get; set; }

        /// <summary>
        /// Whether the user has reached their daily message limit
        /// </summary>
        public bool HasReachedDailyLimit { get; set; }
    }
}
