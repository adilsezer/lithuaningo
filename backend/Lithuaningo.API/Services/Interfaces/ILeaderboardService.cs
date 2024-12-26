namespace Lithuaningo.API.Services.Interfaces;

public interface ILeaderboardService
{
    Task<List<Leaderboard>> GetLeaderboardAsync();
}