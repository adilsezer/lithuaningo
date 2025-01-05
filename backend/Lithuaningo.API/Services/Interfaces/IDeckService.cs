using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IDeckService
    {
        Task<List<Deck>> GetDecksAsync(string? category = null, int? limit = null);
        Task<Deck?> GetDeckByIdAsync(string id);
        Task<List<Deck>> GetUserDecksAsync(string userId);
        Task<List<Deck>> GetTopRatedDecksAsync(int limit = 10);
        Task<string> CreateDeckAsync(Deck deck);
        Task UpdateDeckAsync(string id, Deck deck);
        Task DeleteDeckAsync(string id);
        Task<bool> VoteDeckAsync(string id, string userId, bool isUpvote);
        Task<List<Deck>> SearchDecksAsync(string query, string? category = null);
        Task<List<Flashcard>> GetDeckFlashcardsAsync(string deckId);
        Task<string> AddFlashcardToDeckAsync(string deckId, Flashcard flashcard);
        Task RemoveFlashcardFromDeckAsync(string deckId, string flashcardId);
    }
} 