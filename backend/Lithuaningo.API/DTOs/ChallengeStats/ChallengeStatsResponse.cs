using System;

namespace Lithuaningo.API.DTOs.ChallengeStats;

/// <summary>
/// Represents a user's challenge statistics and progress
/// </summary>
public class ChallengeStatsResponse
{
    /// <summary>
    /// The user's unique identifier
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Total number of cards reviewed
    /// </summary>
    public int CardsReviewed { get; set; }

    /// <summary>
    /// Total number of cards mastered
    /// </summary>
    public int CardsMastered { get; set; }

    /// <summary>
    /// Current streak of daily activity
    /// </summary>
    public int CurrentStreak { get; set; }

    /// <summary>
    /// Longest streak achieved
    /// </summary>
    public int LongestStreak { get; set; }

    /// <summary>
    /// Weekly goal for cards to review
    /// </summary>
    public int WeeklyGoal { get; set; }

    /// <summary>
    /// Current progress towards weekly goal
    /// </summary>
    public int WeeklyProgress { get; set; }

    /// <summary>
    /// Human-readable time since last activity
    /// </summary>
    public string LastActivityTimeAgo { get; set; } = string.Empty;

    /// <summary>
    /// Date of last activity
    /// </summary>
    public DateTime LastActivityDate { get; set; }
}