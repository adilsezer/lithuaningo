using System.ComponentModel.DataAnnotations;
using Lithuaningo.API.DTOs.Flashcard;
using Swashbuckle.AspNetCore.Annotations;

namespace Lithuaningo.API.DTOs.Challenge;

/// <summary>
/// Request to get review challenge questions for premium users
/// </summary>
public class GetReviewChallengeQuestionsRequest
{
    /// <summary>
    /// Optional user ID override (primarily for testing/development).
    /// If not provided, the authenticated user's ID will be used.
    /// </summary>
    public string? UserId { get; set; }

    /// <summary>
    /// Number of challenge questions to generate (default: 10, max: 50)
    /// </summary>
    [Range(1, 50, ErrorMessage = "Count must be between 1 and 50")]
    public int Count { get; set; } = 10;

    /// <summary>
    /// Optional category ID to filter flashcards by specific category.
    /// If not provided, questions will be generated from all categories.
    /// </summary>
    public string? CategoryId { get; set; }

    /// <summary>
    /// Optional difficulty level to filter flashcards by difficulty.
    /// If not provided, flashcards of all difficulty levels will be considered.
    /// </summary>
    public DifficultyLevel? Difficulty { get; set; }
}