
namespace Services.Quiz.Interfaces;

public interface IQuestionGenerator
{
    /// <summary>
    /// Generates a quiz question based on the provided sentence and context
    /// </summary>
    /// <param name="sentence">The sentence to generate a question from</param>
    /// <param name="userId">The user ID for context</param>
    /// <param name="wordFormsCache">Pre-cached word forms to avoid duplicate service calls</param>
    /// <returns>A generated quiz question</returns>
    Task<QuizQuestion> GenerateQuestion(
        Sentence sentence,
        string userId,
        Dictionary<string, WordForm> wordFormsCache);
}
