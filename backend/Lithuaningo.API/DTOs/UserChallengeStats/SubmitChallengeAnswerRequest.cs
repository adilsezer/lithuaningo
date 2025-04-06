using System;
using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.UserChallengeStats;

/// <summary>
/// Request to submit a challenge answer and update user statistics
/// </summary>
public class SubmitChallengeAnswerRequest
{
    /// <summary>
    /// Whether the answer was correct
    /// </summary>
    [Required]
    public bool WasCorrect { get; set; }

    /// <summary>
    /// The ID of the challenge being answered
    /// </summary>
    [Required]
    public Guid ChallengeId { get; set; }
}