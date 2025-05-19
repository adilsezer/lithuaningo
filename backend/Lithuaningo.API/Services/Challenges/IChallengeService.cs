using Lithuaningo.API.DTOs.Challenge;

namespace Lithuaningo.API.Services.Challenges
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

        /// <summary>
        /// Generates a review challenge for a premium user based on their seen flashcards.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <param name="count">The number of challenge questions to generate.</param>
        /// <returns>A list of challenge questions for review.</returns>
        Task<IEnumerable<ChallengeQuestionResponse>> GenerateReviewChallengeQuestionsAsync(string userId, int count = 10);
    }
}
