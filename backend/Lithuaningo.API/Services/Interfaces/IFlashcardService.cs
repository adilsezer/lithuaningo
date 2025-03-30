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

        Task<IEnumerable<FlashcardResponse>> GetFlashcardsAsync(string topic, string userId, int count = 10);
    }
}
