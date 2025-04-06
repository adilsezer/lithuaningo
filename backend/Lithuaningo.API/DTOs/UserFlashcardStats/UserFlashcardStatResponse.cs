using System;

namespace Lithuaningo.API.DTOs.UserFlashcardStats;

/// <summary>
/// Response containing flashcard statistics for a user
/// </summary>
public class UserFlashcardStatResponse
{
    /// <summary>
    /// Unique identifier for the statistic record
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// The user's ID
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// The flashcard's ID
    /// </summary>
    public Guid FlashcardId { get; set; }

    /// <summary>
    /// Number of times the flashcard has been viewed
    /// </summary>
    public int ViewCount { get; set; }

    /// <summary>
    /// Number of times the flashcard was answered correctly
    /// </summary>
    public int CorrectCount { get; set; }

    /// <summary>
    /// Number of times the flashcard was answered incorrectly
    /// </summary>
    public int IncorrectCount { get; set; }

    /// <summary>
    /// Whether the flashcard was answered correctly last time
    /// </summary>
    public bool? LastAnsweredCorrectly { get; set; }

    /// <summary>
    /// Current mastery level (0-5)
    /// </summary>
    public int MasteryLevel { get; set; }
}