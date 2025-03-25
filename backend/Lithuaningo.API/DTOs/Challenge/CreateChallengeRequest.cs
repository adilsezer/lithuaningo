using System;

namespace Lithuaningo.API.DTOs.Challenge;

/// <summary>
/// Request parameters for generating challenge questions
/// </summary>
public class CreateChallengeRequest
{
    /// <summary>
    /// The description or topic for the challenges
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// The number of challenges to generate (default: 5)
    /// </summary>
    public int Count { get; set; } = 5;
} 