using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Lithuaningo.API.Models
{
    /// <summary>
    /// Represents user chat usage statistics.
    /// </summary>
    [Table("user_chat_stats")]
    public class UserChatStats : BaseModel
    {
        /// <summary>
        /// Primary key.
        /// </summary>
        [PrimaryKey("id", false)]
        public Guid Id { get; set; }

        /// <summary>
        /// The user ID associated with these stats.
        /// </summary>
        [Column("user_id")]
        public Guid UserId { get; set; }

        /// <summary>
        /// Date of last chat message.
        /// </summary>
        [Column("last_chat_date")]
        public DateTime LastChatDate { get; set; }

        /// <summary>
        /// Number of messages sent today.
        /// </summary>
        [Column("today_message_count")]
        public int TodayMessageCount { get; set; }

        /// <summary>
        /// Total number of messages sent all-time.
        /// </summary>
        [Column("total_message_count")]
        public int TotalMessageCount { get; set; }
    }
}
