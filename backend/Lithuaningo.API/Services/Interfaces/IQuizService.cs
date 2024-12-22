namespace Services.Quiz.Interfaces;

public interface IQuizService
{
    /// <summary>
    /// Generates a quiz with mixed question types based on user's learned sentences
    /// </summary>
    /// <param name="userId">The user to generate the quiz for</param>
    /// <returns>A list of quiz questions</returns>
    Task<List<QuizQuestion>> GenerateQuizAsync(string userId);
}
