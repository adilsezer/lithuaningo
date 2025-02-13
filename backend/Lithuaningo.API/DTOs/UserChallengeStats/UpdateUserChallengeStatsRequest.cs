using System;
using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.UserChallengeStats;

/// <summary>
/// Request to update challenge statistics for a user
/// </summary>
public class UpdateUserChallengeStatsRequest
{
    /// <summary>
    /// Current streak of daily challenges
    /// </summary>
    [Required]
    [Range(0, int.MaxValue)]
    public int CurrentStreak { get; set; }

    /// <summary>
    /// Longest streak achieved
    /// </summary>
    [Required]
    [Range(0, int.MaxValue)]
    public int LongestStreak { get; set; }

    /// <summary>
    /// Number of correct answers today
    /// </summary>
    [Required]
    [Range(0, int.MaxValue)]
    public int TodayCorrectAnswers { get; set; }

    /// <summary>
    /// Number of incorrect answers today
    /// </summary>
    [Required]
    [Range(0, int.MaxValue)]
    public int TodayIncorrectAnswers { get; set; }

    /// <summary>
    /// Total number of challenges completed
    /// </summary>
    [Required]
    [Range(0, int.MaxValue)]
    public int TotalChallengesCompleted { get; set; }

    /// <summary>
    /// Total number of correct answers
    /// </summary>
    [Required]
    [Range(0, int.MaxValue)]
    public int TotalCorrectAnswers { get; set; }

    /// <summary>
    /// Total number of incorrect answers
    /// </summary>
    [Required]
    [Range(0, int.MaxValue)]
    public int TotalIncorrectAnswers { get; set; }
}