using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Flashcards
{
    public interface IFlashcardService
    {
        /// <summary>
        /// Retrieves a specific flashcard by its ID
        /// </summary>
        /// <param name="flashcardId">The ID of the flashcard to retrieve</param>
        /// <returns>The flashcard model if found, otherwise throws an exception</returns>
        Task<Flashcard> GetFlashcardByIdAsync(Guid flashcardId);

        /// <summary>
        /// Retrieves flashcards based on specified criteria as model objects for internal use
        /// </summary>
        /// <param name="category">The flashcard category</param>
        /// <param name="difficulty">The difficulty level</param>
        /// <param name="limit">Maximum number of flashcards to retrieve</param>
        /// <param name="isVerified">Filter by verified status</param>
        /// <returns>A collection of Flashcard model objects</returns>
        Task<IEnumerable<Flashcard>> RetrieveFlashcardModelsAsync(
            FlashcardCategory? category = null,
            DifficultyLevel? difficulty = null,
            int? limit = null,
            bool? isVerified = null);

        /// <summary>
        /// Generates flashcards using AI based on provided parameters without saving them
        /// </summary>
        /// <param name="request">Parameters for flashcard generation</param>
        /// <param name="contextSampleSize">Size of the sample of existing flashcards to use for context (defaults to 100)</param>
        /// <returns>A collection of generated flashcard DTOs</returns>
        Task<IEnumerable<FlashcardResponse>> GenerateFlashcardsAsync(FlashcardRequest request, int contextSampleSize = 100);

        /// <summary>
        /// Gets flashcards for a category, generating new ones if needed, with spaced repetition for users
        /// </summary>
        /// <param name="request">The flashcard request details</param>
        /// <param name="userId">The ID of the user requesting flashcards</param>
        /// <returns>A list of flashcard DTOs</returns>
        Task<IEnumerable<FlashcardResponse>> GetUserLearningFlashcardsAsync(FlashcardRequest request, string userId);

        /// <summary>
        /// Generates an image for a flashcard using AI and updates the flashcard's ImageUrl
        /// </summary>
        /// <param name="flashcardId">ID of the flashcard to generate an image for</param>
        /// <returns>The URL of the generated image</returns>
        Task<string> GenerateFlashcardImageAsync(Guid flashcardId);

        /// <summary>
        /// Generates audio for a flashcard using text-to-speech and updates the flashcard's AudioUrl
        /// </summary>
        /// <param name="flashcardId">ID of the flashcard to generate audio for</param>
        /// <returns>The URL of the generated audio file</returns>
        /// <remarks>
        /// The audio will contain both the front text and the example sentence with a pause between them,
        /// providing a comprehensive audio experience for the user.
        /// </remarks>
        Task<string> GenerateFlashcardAudioAsync(Guid flashcardId);

        Task<Flashcard> UpdateFlashcardAdminAsync(Guid flashcardId, UpdateFlashcardAdminRequest request);
    }
}
