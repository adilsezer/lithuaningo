using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.Quiz;

namespace Lithuaningo.API.Services.Interfaces
{
    /// <summary>
    /// Provides functionality for generating and retrieving daily quiz questions.
    /// </summary>
    public interface IQuizService
    {
        /// <summary>
        /// Retrieves the quiz questions for the current day. If none exist, they are automatically created.
        /// </summary>
        /// <returns>A list of quiz questions.</returns>
        Task<IEnumerable<QuizQuestionResponse>> GetDailyQuizQuestionsAsync();

        /// <summary>
        /// Generates new quiz questions for the day using the ChatGPT 4o mini API and stores them in Supabase.
        /// </summary>
        Task<IEnumerable<QuizQuestionResponse>> CreateDailyQuizQuestionsAsync(IEnumerable<CreateQuizQuestionRequest> questions);
    }
}
