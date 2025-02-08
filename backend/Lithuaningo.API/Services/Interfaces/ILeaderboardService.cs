using System.Threading.Tasks;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface ILeaderboardService
    {
        Task<LeaderboardWeek> GetCurrentWeekLeaderboardAsync();
        Task<LeaderboardWeek> GetWeekLeaderboardAsync(string weekId);
        Task UpdateLeaderboardEntryAsync(string userId, string name, int score);
    }
}
