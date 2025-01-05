using Lithuaningo.API.Services.Quiz.Interfaces;

namespace Lithuaningo.API.Services.Quiz.Factory;

public interface IQuestionGeneratorFactory
{
    /// <summary>
    /// Creates a question generator for the specified question type
    /// </summary>
    /// <param name="type">The type of question to generate</param>
    /// <returns>A question generator instance</returns>
    IQuestionGenerator Create(QuestionType type);
} 