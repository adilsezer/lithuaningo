using System;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace Lithuaningo.API.Models;

[Table("challenge_stats")]
public class ChallengeStats : BaseModel
{
    [PrimaryKey("id")]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("current_streak")]
    public int CurrentStreak { get; set; }

    [Column("longest_streak")]
    public int LongestStreak { get; set; }

    [Column("last_challenge_date")]
    public DateTime LastChallengeDate { get; set; }

    [Column("has_completed_today_challenge")]
    public bool HasCompletedTodayChallenge { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
} 