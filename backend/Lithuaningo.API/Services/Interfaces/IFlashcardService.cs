using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IFlashcardService
    {
        Task<Flashcard?> GetFlashcardByIdAsync(string id);
        Task<List<Flashcard>> GetUserFlashcardsAsync(string userId);
        Task<string> CreateFlashcardAsync(Flashcard flashcard);
        Task UpdateFlashcardAsync(string id, Flashcard flashcard);
        Task DeleteFlashcardAsync(string id);
        Task<List<Flashcard>> GetDueForReviewAsync(string userId, int limit = 20);
        Task UpdateReviewStatusAsync(string id, bool wasCorrect);
        Task<List<Flashcard>> GetRandomFlashcardsAsync(int limit = 10);
        Task<List<Flashcard>> SearchFlashcardsAsync(string query);
    }
} 