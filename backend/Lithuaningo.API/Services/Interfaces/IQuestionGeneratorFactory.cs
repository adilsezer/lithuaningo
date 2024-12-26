namespace Services.Quiz.Interfaces;

public interface IQuestionGeneratorFactory
{
    /// <summary>
    /// Creates a question generator for the specified question type
    /// </summary>
    /// <param name="type">The type of question to generate</param>
    /// <returns>A question generator instance</returns>
    /// <exception cref="ArgumentException">Thrown when question type is not supported</exception>
    IQuestionGenerator Create(QuestionType type);
}
