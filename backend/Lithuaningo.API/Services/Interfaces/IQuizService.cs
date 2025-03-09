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
        /// Retrieves the quiz questions for the current day. If none exist, they are automatically created using AI.
        /// </summary>
        /// <returns>A list of quiz questions.</returns>
        Task<IEnumerable<QuizQuestionResponse>> GetDailyQuizQuestionsAsync();
        
        /// <summary>
        /// Generates new quiz questions using AI without checking if questions already exist.
        /// </summary>
        /// <returns>The generated quiz questions</returns>
        Task<IEnumerable<QuizQuestionResponse>> GenerateAIQuizQuestionsAsync();
    }
}
