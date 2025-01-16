using Lithuaningo.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface ILeaderboardService
    {
        Task<LeaderboardWeek> GetCurrentWeekLeaderboardAsync();
        Task<LeaderboardWeek> GetWeekLeaderboardAsync(string weekId);
        Task UpdateLeaderboardEntryAsync(string userId, string name, int score);
    }
} 