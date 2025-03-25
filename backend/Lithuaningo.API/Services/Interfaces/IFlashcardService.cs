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
        /// <returns>A list of generated flashcards</returns>
        Task<List<FlashcardResponse>> GenerateFlashcardsAsync(CreateFlashcardRequest request);
    }
}
