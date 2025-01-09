using System.Threading.Tasks;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IPracticeService
    {
        Task<PracticeStats> GetPracticeStatsAsync(string deckId, string userId);
        Task TrackPracticeProgressAsync(string deckId, string userId, string flashcardId, bool isCorrect);
        Task<List<PracticeStats>> GetUserPracticeHistoryAsync(string userId);
    }
} 