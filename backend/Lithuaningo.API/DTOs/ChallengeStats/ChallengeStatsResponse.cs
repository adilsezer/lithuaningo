using System;

namespace Lithuaningo.API.DTOs.ChallengeStats;

/// <summary>
/// Represents a user's challenge statistics and progress
/// </summary>
public class ChallengeStatsResponse
{
    /// <summary>
    /// Current streak of daily challenges
    /// </summary>
    public int CurrentStreak { get; set; }

    /// <summary>
    /// Longest streak achieved
    /// </summary>
    public int LongestStreak { get; set; }

    /// <summary>
    /// Date of last completed challenge
    /// </summary>
    public DateTime LastChallengeDate { get; set; }

    /// <summary>
    /// Whether the user has completed today's challenge
    /// </summary>
    public bool HasCompletedTodayChallenge { get; set; }
}