using System;
using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.ChallengeStats;

/// <summary>
/// Request to update challenge statistics for a user
/// </summary>
public class UpdateChallengeStatsRequest
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
}