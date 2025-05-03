using System;

namespace Lithuaningo.API.DTOs.UserChallengeStats;

/// <summary>
/// Represents a user's challenge statistics and progress
/// </summary>
public class UserChallengeStatsResponse
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
    /// Date of last active challenge
    /// </summary>
    public DateTime LastChallengeDate { get; set; }

    /// <summary>
    /// Whether the user has completed today's challenge
    /// </summary>
    public bool HasCompletedTodayChallenge { get; set; }

    /// <summary>
    /// Number of correct answers today
    /// </summary>
    public int TodayCorrectAnswers { get; set; }

    /// <summary>
    /// Number of incorrect answers today
    /// </summary>
    public int TodayIncorrectAnswers { get; set; }

    /// <summary>
    /// Total number of challenges completed
    /// </summary>
    public int TotalChallengesCompleted { get; set; }

    /// <summary>
    /// Total number of correct answers
    /// </summary>
    public int TotalCorrectAnswers { get; set; }

    /// <summary>
    /// Total number of incorrect answers
    /// </summary>
    public int TotalIncorrectAnswers { get; set; }

    /// <summary>
    /// Total number of answers today (correct + incorrect)
    /// </summary>
    public int TodayTotalAnswers => TodayCorrectAnswers + TodayIncorrectAnswers;
}