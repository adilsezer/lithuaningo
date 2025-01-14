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
        Task<List<Deck>> GetTopRatedDecksAsync(int limit = 10, string timeRange = "all");
        Task<string> CreateDeckAsync(Deck deck);
        Task UpdateDeckAsync(string id, Deck deck);
        Task DeleteDeckAsync(string id);
        Task<bool> VoteDeckAsync(string id, string userId, bool isUpvote);
        Task<List<Deck>> SearchDecksAsync(string query, string? category = null);
        Task<List<Flashcard>> GetDeckFlashcardsAsync(string deckId);
        Task ReportDeckAsync(string id, string userId, string reason);
        Task<double> GetDeckRatingAsync(string deckId, string timeRange = "all");
    }
} 