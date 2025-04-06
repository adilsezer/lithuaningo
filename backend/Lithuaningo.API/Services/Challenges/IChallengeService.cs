using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.Challenge;

namespace Lithuaningo.API.Services.Interfaces
{
    /// <summary>
    /// Provides functionality for generating and retrieving daily challenge questions.
    /// </summary>
    public interface IChallengeService
    {
        /// <summary>
        /// Generates new challenge questions using AI without checking if questions already exist.
        /// </summary>
        /// <returns>The generated challenge questions</returns>
        Task<IEnumerable<ChallengeQuestionResponse>> GenerateAIChallengeQuestionsAsync();

        /// <summary>
        /// Gets or generates daily challenge questions. Will retrieve from cache if available 
        /// for the current day, otherwise will generate new ones.
        /// </summary>
        /// <returns>The daily challenge questions</returns>
        Task<IEnumerable<ChallengeQuestionResponse>> GetDailyChallengeQuestionsAsync();
    }
}
