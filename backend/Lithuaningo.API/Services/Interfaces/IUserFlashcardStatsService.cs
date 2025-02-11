using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IUserFlashcardStatsService
    {
        Task<UserFlashcardStats> GetUserFlashcardStatsAsync(string deckId, string userId);
        Task TrackUserFlashcardStatsAsync(string deckId, string userId, string flashcardId, bool isCorrect);
        Task<List<UserFlashcardStats>> GetUserFlashcardHistoryAsync(string userId);
    }
}
