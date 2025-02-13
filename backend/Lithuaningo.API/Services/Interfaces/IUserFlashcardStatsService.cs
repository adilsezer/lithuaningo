using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.UserFlashcardStats;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IUserFlashcardStatsService
    {
        Task<UserFlashcardStatsResponse> GetUserFlashcardStatsAsync(string deckId, string userId);
        Task TrackUserFlashcardStatsAsync(string deckId, string userId, TrackProgressRequest request);
        Task<List<UserFlashcardStatsResponse>> GetUserFlashcardHistoryAsync(string userId);
    }
}
