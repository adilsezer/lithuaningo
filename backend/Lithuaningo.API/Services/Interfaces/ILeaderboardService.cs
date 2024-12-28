namespace Lithuaningo.API.Services.Interfaces;

public interface ILeaderboardService
{
    Task AddLeaderboardEntryAsync(LeaderboardEntry entry);
    Task<List<LeaderboardEntry>> GetLeaderboardEntriesAsync();
    Task ResetLeaderboardAsync();
}