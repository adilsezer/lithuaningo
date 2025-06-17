namespace Lithuaningo.API.DTOs.AI;

/// <summary>
/// Request DTO for getting AI explanation about a challenge question
/// </summary>
public class QuestionExplanationRequest
{
    /// <summary>
    /// The challenge question text
    /// </summary>
    public string Question { get; set; } = string.Empty;

    /// <summary>
    /// The correct answer to the question
    /// </summary>
    public string CorrectAnswer { get; set; } = string.Empty;

    /// <summary>
    /// The user's selected answer
    /// </summary>
    public string UserAnswer { get; set; } = string.Empty;

    /// <summary>
    /// All available options for the question
    /// </summary>
    public List<string> Options { get; set; } = new();

    /// <summary>
    /// Example sentence if available
    /// </summary>
    public string? ExampleSentence { get; set; }

    /// <summary>
    /// The type of question (e.g., "MultipleChoice", "TrueFalse", etc.)
    /// </summary>
    public string QuestionType { get; set; } = string.Empty;
}