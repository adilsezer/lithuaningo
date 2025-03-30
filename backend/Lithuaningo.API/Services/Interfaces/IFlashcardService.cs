using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Lithuaningo.API.DTOs.Flashcard;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IFlashcardService
    {
        Task<string> UploadFlashcardFileAsync(IFormFile file);
        
        /// <summary>
        /// Generates flashcards using AI based on provided parameters without saving them
        /// </summary>
        /// <param name="request">Parameters for flashcard generation</param>
        /// <returns>A collection of generated flashcards</returns>
        Task<IEnumerable<FlashcardResponse>> GenerateFlashcardsAsync(FlashcardRequest request);

        /// <summary>
        /// Gets flashcards for a topic, generating new ones if needed
        /// </summary>
        /// <param name="topic">The topic to get flashcards for</param>
        /// <param name="userId">The ID of the user requesting flashcards</param>
        /// <param name="count">Number of flashcards to return (default: 10)</param>
        /// <param name="difficulty">The difficulty level of flashcards (default: Basic)</param>
        /// <returns>A list of flashcards</returns>
        Task<IEnumerable<FlashcardResponse>> GetFlashcardsAsync(string topic, string userId, int count = 10, DifficultyLevel difficulty = DifficultyLevel.Basic);
    }
}
