using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.Flashcard;
using Microsoft.AspNetCore.Http;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IFlashcardService
    {
        Task<FlashcardResponse?> GetFlashcardByIdAsync(string id);
        Task<string> CreateFlashcardAsync(CreateFlashcardRequest request);
        Task<FlashcardResponse> UpdateFlashcardAsync(string id, UpdateFlashcardRequest request);
        Task DeleteFlashcardAsync(string id);
        Task<List<FlashcardResponse>> GetRandomFlashcardsAsync(int limit = 10);
        Task<List<FlashcardResponse>> SearchFlashcardsAsync(string query);
        Task<string> UploadFlashcardFileAsync(IFormFile file);
    }
}
