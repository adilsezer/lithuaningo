using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Challenges
{
    /// <summary>
    /// Provides functionality for generating and retrieving daily challenge questions.
    /// </summary>
    public interface IChallengeService
    {
        /// <summary>
        /// Gets or generates daily challenge questions. Will retrieve from cache if available 
        /// for the current day, otherwise will generate new ones.
        /// </summary>
        /// <returns>The daily challenge questions</returns>
        Task<IEnumerable<ChallengeQuestionResponse>> GetDailyChallengeQuestionsAsync();

        /// <summary>
        /// Generates a review challenge for a premium user based on their seen flashcards.
        /// </summary>
        /// <param name="request">The request containing challenge generation parameters including user ID.</param>
        /// <returns>A list of challenge questions for review.</returns>
        Task<IEnumerable<ChallengeQuestionResponse>> GetChallengeQuestionsForSeenFlashcardsAsync(GetReviewChallengeQuestionsRequest request);

        /// <summary>
        /// Generates challenge questions for a given flashcard using the AI service and saves them to the database.
        /// </summary>
        /// <param name="flashcard">The flashcard to generate challenges for.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        /// <exception cref="ArgumentNullException">Thrown if flashcard is null.</exception>
        /// <exception cref="InvalidOperationException">Thrown if AI generation or saving fails.</exception>
        Task GenerateAndSaveChallengesForFlashcardAsync(Flashcard flashcard);

        /// <summary>
        /// Clears all challenge questions associated with a specific flashcard.
        /// </summary>
        /// <param name="flashcardId">The ID of the flashcard whose challenges are to be cleared.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task ClearChallengesByFlashcardIdAsync(Guid flashcardId);
    }
}
