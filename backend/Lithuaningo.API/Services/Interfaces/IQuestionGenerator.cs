using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.Models;

namespace Services.Quiz.Interfaces;

public interface IQuestionGenerator
{
    /// <summary>
    /// Generates a quiz question based on the provided context
    /// </summary>
    /// <param name="userId">The user ID for context</param>
    /// <param name="wordFormsCache">Pre-cached word forms to avoid duplicate service calls</param>
    /// <returns>A generated quiz question</returns>
    Task<QuizQuestion> GenerateQuestion(
        string userId,
        Dictionary<string, WordForm> wordFormsCache);
}
