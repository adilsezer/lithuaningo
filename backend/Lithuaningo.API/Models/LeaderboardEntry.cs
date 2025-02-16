using System;
using System.ComponentModel.DataAnnotations;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace Lithuaningo.API.Models
{
    /// <summary>
    /// Represents a leaderboard entry for a specific user in a specific week
    /// </summary>
    [Table("leaderboard_entries")]
    public class LeaderboardEntry : BaseModel
    {
        /// <summary>
        /// Unique identifier for the leaderboard entry
        /// </summary>
        [PrimaryKey("id")]
        [Column("id")]
        public Guid Id { get; set; }

        /// <summary>
        /// The user's unique identifier (foreign key to auth.users)
        /// </summary>
        [Column("user_id")]
        [Required]
        public Guid UserId { get; set; }

        /// <summary>
        /// The user's score for the week
        /// </summary>
        [Column("score")]
        [Range(0, int.MaxValue, ErrorMessage = "Score must be non-negative")]
        public int Score { get; set; }

        /// <summary>
        /// The ISO week identifier in YYYY-WW format
        /// This is automatically set and validated by database triggers to match created_at
        /// </summary>
        [Column("week_id")]
        [Required]
        [RegularExpression(@"^\d{4}-\d{2}$", ErrorMessage = "Week ID must be in YYYY-WW format")]
        public string WeekId { get; set; } = string.Empty;

        /// <summary>
        /// When the entry was created, used to determine the week_id
        /// </summary>
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When the entry was last updated
        /// </summary>
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}
