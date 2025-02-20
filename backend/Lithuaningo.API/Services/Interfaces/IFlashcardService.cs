using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.Flashcard;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IFlashcardService
    {
        Task<FlashcardResponse?> GetFlashcardByIdAsync(string id);
        Task<string> CreateFlashcardAsync(CreateFlashcardRequest request);
        Task<FlashcardResponse> UpdateFlashcardAsync(string id, UpdateFlashcardRequest request);
        Task DeleteFlashcardAsync(string id);
        Task<List<FlashcardResponse>> GetDueForReviewAsync(string userId, int limit = 20);
        Task UpdateReviewStatusAsync(string id, bool wasCorrect);
        Task<List<FlashcardResponse>> GetRandomFlashcardsAsync(int limit = 10);
        Task<List<FlashcardResponse>> SearchFlashcardsAsync(string query);
    }
}
