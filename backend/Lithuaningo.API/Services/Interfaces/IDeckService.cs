using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.Deck;
using Microsoft.AspNetCore.Http;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IDeckService
    {
        Task<List<DeckResponse>> GetDecksAsync(string? category = null, int? limit = null);
        Task<DeckResponse?> GetDeckByIdAsync(string id);
        Task<List<DeckResponse>> GetUserDecksAsync(string userId);
        Task<List<DeckWithRatingResponse>> GetTopRatedDecksAsync(int limit = 10, string timeRange = "all");
        Task<DeckResponse> CreateDeckAsync(CreateDeckRequest request);
        Task<DeckResponse> UpdateDeckAsync(string id, UpdateDeckRequest request);
        Task DeleteDeckAsync(string id);
        Task<List<DeckResponse>> SearchDecksAsync(string query, string? category = null);
        Task<List<Flashcard>> GetDeckFlashcardsAsync(string deckId);
        Task ReportDeckAsync(string id, string userId, string reason);
        Task<string> UploadDeckImageAsync(IFormFile file);
    }
}
