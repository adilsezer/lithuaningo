using Lithuaningo.API.DTOs.UserFlashcardStats;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Stats
{
    public interface IUserFlashcardStatService
    {
        /// <summary>
        /// Gets the IDs of the last 'count' flashcards seen by the user, ordered by the most recently seen.
        /// </summary>
        /// <param name="userId">The user ID.</param>
        /// <param name="count">The number of flashcard IDs to retrieve.</param>
        /// <returns>A list of flashcard IDs, ordered by most recently seen.</returns>
        Task<List<Guid>> GetLastSeenFlashcardIdsAsync(string userId, int count = 10);

        /// <summary>
        /// Gets all unique flashcard IDs that the user has ever interacted with (e.g., viewed, answered).
        /// </summary>
        /// <param name="userId">The user ID.</param>
        /// <returns>A HashSet of all unique flashcard IDs the user has interacted with.</returns>
        Task<HashSet<Guid>> GetAllUserInteractedFlashcardIdsAsync(string userId);

        /// <summary>
        /// Submits a flashcard answer and updates the user's statistics
        /// </summary>
        /// <param name="userId">The ID of the user</param>
        /// <param name="request">The submission details</param>
        /// <returns>The updated user flashcard statistics</returns>
        Task<UserFlashcardStatResponse> SubmitFlashcardAnswerAsync(string userId, SubmitFlashcardAnswerRequest request);

        /// <summary>
        /// Gets flashcard stats for cards that need to be reviewed by the user
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="flashcardIds">Optional list of flashcard IDs to filter by</param>
        /// <param name="limit">Maximum number of stats to return</param>
        /// <returns>List of flashcard stats prioritized for review</returns>
        Task<List<UserFlashcardStatResponse>> GetFlashcardsDueForReviewAsync(string userId, IEnumerable<Guid>? flashcardIds = null, int limit = 20);

        /// <summary>
        /// Gets a summary of the user's flashcard statistics
        /// </summary>
        /// <param name="userId">The ID of the user</param>
        /// <returns>A summary of the user's flashcard statistics</returns>
        Task<UserFlashcardStatsSummaryResponse> GetUserFlashcardStatsSummaryAsync(string userId);

        /// <summary>
        /// Gets the statistics for a specific flashcard
        /// </summary>
        /// <param name="userId">The ID of the user</param>
        /// <param name="flashcardId">The ID of the flashcard</param>
        /// <returns>The statistics for the specified flashcard</returns>
        Task<UserFlashcardStatResponse> GetFlashcardStatsAsync(string userId, string flashcardId);

        /// <summary>
        /// Increments the view count for a specific flashcard for a user.
        /// If no stat record exists, it creates one with ViewCount = 1.
        /// Other stats like CorrectCount, IncorrectCount, MasteryLevel are not affected by this operation.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <param name="flashcardId">The ID of the flashcard.</param>
        /// <returns>The updated user flashcard statistics.</returns>
        Task<UserFlashcardStatResponse> IncrementFlashcardViewCountAsync(string userId, Guid flashcardId);
    }
}