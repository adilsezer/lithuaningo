using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IFlashcardStatsService
    {
        Task<FlashcardStats> GetFlashcardStatsAsync(string deckId, string userId);
        Task TrackFlashcardStatsAsync(string deckId, string userId, string flashcardId, bool isCorrect);
        Task<List<FlashcardStats>> GetUserFlashcardHistoryAsync(string userId);
    }
}
