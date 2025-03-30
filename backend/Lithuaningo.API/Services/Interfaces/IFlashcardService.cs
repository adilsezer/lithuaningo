using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IFlashcardService
    {
        /// <summary>
        /// Uploads a file for a flashcard and returns the URL
        /// </summary>
        /// <param name="file">The file to upload</param>
        /// <returns>The URL of the uploaded file</returns>
        Task<string> UploadFlashcardFileAsync(IFormFile file);
        
        /// <summary>
        /// Generates flashcards using AI based on provided parameters without saving them
        /// </summary>
        /// <param name="request">Parameters for flashcard generation</param>
        /// <returns>A collection of generated flashcard DTOs</returns>
        Task<IEnumerable<FlashcardResponse>> GenerateFlashcardsAsync(FlashcardRequest request);
        
        /// <summary>
        /// Gets flashcards for a category, generating new ones if needed
        /// </summary>
        /// <param name="request">The flashcard request details</param>
        /// <param name="userId">The ID of the user requesting flashcards</param>
        /// <returns>A list of flashcard DTOs</returns>
        Task<IEnumerable<FlashcardResponse>> GetFlashcardsAsync(FlashcardRequest request, string userId);
    }
}
