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
        /// Retrieves the challenge questions for the current day. If none exist, they are automatically created using AI.
        /// </summary>
        /// <returns>A list of challenge questions.</returns>
        Task<IEnumerable<ChallengeQuestionResponse>> GetDailyChallengeQuestionsAsync();
        
        /// <summary>
        /// Generates new challenge questions using AI without checking if questions already exist.
        /// </summary>
        /// <returns>The generated challenge questions</returns>
        Task<IEnumerable<ChallengeQuestionResponse>> GenerateAIChallengeQuestionsAsync();
        
        /// <summary>
        /// Generates challenge questions for a specific deck using its flashcards.
        /// </summary>
        /// <param name="deckId">The ID of the deck to generate questions for</param>
        /// <returns>The generated challenge questions for the specific deck</returns>
        Task<IEnumerable<ChallengeQuestionResponse>> GenerateDeckChallengeQuestionsAsync(string deckId);
    }
}
