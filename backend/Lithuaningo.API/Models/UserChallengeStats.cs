using System;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace Lithuaningo.API.Models;

[Table("user_challenge_stats")]
public class UserChallengeStats : BaseModel
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

    [Column("today_correct_answer_count")]
    public int TodayCorrectAnswerCount { get; set; }

    [Column("today_incorrect_answer_count")]
    public int TodayIncorrectAnswerCount { get; set; }

    [Column("total_challenges_completed")]
    public int TotalChallengesCompleted { get; set; }

    [Column("total_correct_answers")]
    public int TotalCorrectAnswers { get; set; }

    [Column("total_incorrect_answers")]
    public int TotalIncorrectAnswers { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
} 