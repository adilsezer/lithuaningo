using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.Models;
using Microsoft.AspNetCore.Http;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IFlashcardService
    {
        /// <summary>
        /// Generates flashcards using AI based on provided parameters without saving them
        /// </summary>
        /// <param name="request">Parameters for flashcard generation</param>
        /// <param name="contextSampleSize">Size of the sample of existing flashcards to use for context (defaults to 100)</param>
        /// <returns>A collection of generated flashcard DTOs</returns>
        Task<IEnumerable<FlashcardResponse>> GenerateFlashcardsAsync(FlashcardRequest request, int contextSampleSize = 100);

        /// <summary>
        /// Gets flashcards for a category, generating new ones if needed
        /// </summary>
        /// <param name="request">The flashcard request details</param>
        /// <param name="userId">The ID of the user requesting flashcards</param>
        /// <returns>A list of flashcard DTOs</returns>
        Task<IEnumerable<FlashcardResponse>> GetFlashcardsAsync(FlashcardRequest request, string userId);

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
    }
}
