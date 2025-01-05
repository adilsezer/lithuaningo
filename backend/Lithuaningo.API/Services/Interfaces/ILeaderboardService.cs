using Lithuaningo.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface ILeaderboardService
    {
        Task<List<LeaderboardEntry>> GetLeaderboardAsync(int? limit = null);
        Task AddLeaderboardEntryAsync(LeaderboardEntry entry);
        Task ResetLeaderboardAsync();
    }
} 