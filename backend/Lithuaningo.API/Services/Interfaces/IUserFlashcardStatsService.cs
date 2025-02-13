using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.UserFlashcardStats;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IUserFlashcardStatsService
    {
        Task<UserFlashcardStatsResponse> GetUserFlashcardStatsAsync(string deckId, string userId);
        Task TrackUserFlashcardStatsAsync(string deckId, string userId, string flashcardId, bool isCorrect, int? confidenceLevel = null, int? timeTakenSeconds = null);
        Task<List<UserFlashcardStatsResponse>> GetUserFlashcardHistoryAsync(string userId);
    }
}
