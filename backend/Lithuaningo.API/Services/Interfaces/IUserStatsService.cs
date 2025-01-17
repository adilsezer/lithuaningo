using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IUserStatsService
    {
        Task<UserStats> GetUserStatsAsync(string userId);
        Task UpdateUserStatsAsync(UserStats userStats);
        Task UpdateDailyStreakAsync(string userId);
        Task AddExperiencePointsAsync(string userId, int amount);
        Task AddLearnedWordAsync(string userId, string wordId);
        Task IncrementTotalQuizzesCompletedAsync(string userId);
    }
} 