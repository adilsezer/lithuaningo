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

    [Column("cards_reviewed")]
    public int CardsReviewed { get; set; }

    [Column("cards_mastered")]
    public int CardsMastered { get; set; }

    [Column("current_streak")]
    public int CurrentStreak { get; set; }

    [Column("longest_streak")]
    public int LongestStreak { get; set; }

    [Column("last_activity_date")]
    public DateTime LastActivityDate { get; set; }

    [Column("weekly_goal")]
    public int WeeklyGoal { get; set; } = 50; // Default weekly goal

    [Column("weekly_progress")]
    public int WeeklyProgress { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
} 