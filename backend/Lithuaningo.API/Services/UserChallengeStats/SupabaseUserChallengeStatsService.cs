using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Threading.Tasks;
using static Supabase.Postgrest.Constants;
using Supabase;

namespace Lithuaningo.API.Services;

public class SupabaseUserChallengeStatsService : IUserChallengeStatsService
{
    private readonly Client _supabaseClient;
    private readonly ICacheService _cache;
    private readonly CacheSettings _cacheSettings;
    private const string CacheKeyPrefix = "challenge-stats:";
    private readonly ILogger<SupabaseUserChallengeStatsService> _logger;

    public SupabaseUserChallengeStatsService(
        ISupabaseService supabaseService,
        ICacheService cache,
        IOptions<CacheSettings> cacheSettings,
        ILogger<SupabaseUserChallengeStatsService> logger)
    {
        _supabaseClient = supabaseService.Client;
        _cache = cache;
        _cacheSettings = cacheSettings.Value;
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<UserChallengeStats> GetUserChallengeStatsAsync(string userId)
    {
        if (!Guid.TryParse(userId, out var userGuid))
        {
            throw new ArgumentException("Invalid user ID format", nameof(userId));
        }

        var cacheKey = $"{CacheKeyPrefix}{userGuid}";
        var cached = await _cache.GetAsync<UserChallengeStats>(cacheKey);

        if (cached != null)
        {
            _logger.LogInformation("Retrieved challenge stats from cache for user {UserId}", userId);
            return cached;
        }

        try
        {
            var response = await _supabaseClient
                .From<UserChallengeStats>()
                .Where(u => u.UserId == userGuid)
                .Get();

            var stats = response.Models.FirstOrDefault();
            if (stats == null)
            {
                // Create default stats if none exist
                stats = new UserChallengeStats
                {
                    Id = Guid.NewGuid(),
                    UserId = userGuid,
                    CurrentStreak = 0,
                    LongestStreak = 0,
                    LastChallengeDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var createResponse = await _supabaseClient
                    .From<UserChallengeStats>()
                    .Insert(stats);

                stats = createResponse.Models.First();
                _logger.LogInformation("Created new challenge stats for user {UserId}", userId);
            }

            await _cache.SetAsync(cacheKey, stats,
                TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
            _logger.LogInformation("Retrieved and cached challenge stats for user {UserId}", userId);

            return stats;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving challenge stats for user {UserId}", userId);
            throw;
        }
    }

    public async Task UpdateUserChallengeStatsAsync(UserChallengeStats userChallengeStats)
    {
        if (userChallengeStats == null)
        {
            throw new ArgumentNullException(nameof(userChallengeStats));
        }

        try
        {
            userChallengeStats.UpdatedAt = DateTime.UtcNow;

            var response = await _supabaseClient
                .From<UserChallengeStats>()
                .Where(u => u.Id == userChallengeStats.Id)
                .Update(userChallengeStats);

            var updatedStats = response.Models.First();

            // Invalidate cache
            var cacheKey = $"{CacheKeyPrefix}{userChallengeStats.UserId}";
            await _cache.RemoveAsync(cacheKey);
            _logger.LogInformation("Updated challenge stats for user {UserId}", userChallengeStats.UserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating challenge stats for user {UserId}", userChallengeStats.UserId);
            throw;
        }
    }

    public async Task UpdateDailyStreakAsync(string userId)
    {
        if (!Guid.TryParse(userId, out var userGuid))
        {
            throw new ArgumentException("Invalid user ID format", nameof(userId));
        }

        try
        {
            var userChallengeStats = await GetUserChallengeStatsAsync(userId);
            var today = DateTime.UtcNow.Date;

            if (userChallengeStats.LastChallengeDate.Date < today)
            {
                userChallengeStats.LastChallengeDate = DateTime.UtcNow;

                // Update streak logic
                if (userChallengeStats.LastChallengeDate.Date < today)
                {
                    if (userChallengeStats.LastChallengeDate.Date.AddDays(1) == today)
                    {
                        // Consecutive day
                        userChallengeStats.CurrentStreak++;
                        if (userChallengeStats.CurrentStreak > userChallengeStats.LongestStreak)
                        {
                            userChallengeStats.LongestStreak = userChallengeStats.CurrentStreak;
                        }
                        _logger.LogInformation("Increased streak to {Streak} for user {UserId}", 
                            userChallengeStats.CurrentStreak, userId);
                    }
                    else
                    {
                        // Streak broken
                        userChallengeStats.CurrentStreak = 1;
                        _logger.LogInformation("Reset streak for user {UserId}", userId);
                    }
                }

                await UpdateUserChallengeStatsAsync(userChallengeStats);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating daily streak for user {UserId}", userId);
            throw;
        }
    }

    public async Task AddExperiencePointsAsync(string userId, int amount)
    {
        if (!Guid.TryParse(userId, out var userGuid))
        {
            throw new ArgumentException("Invalid user ID format", nameof(userId));
        }

        try
        {
            var userStats = await GetUserChallengeStatsAsync(userId);
            await UpdateUserChallengeStatsAsync(userStats);
            _logger.LogInformation("Added {Amount} experience points for user {UserId}", amount, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding experience points for user {UserId}", userId);
            throw;
        }
    }

    public async Task AddLearnedWordAsync(string userId, string wordId)
    {
        if (!Guid.TryParse(userId, out var userGuid))
        {
            throw new ArgumentException("Invalid user ID format", nameof(userId));
        }

        try
        {
            var userStats = await GetUserChallengeStatsAsync(userId);
            await UpdateUserChallengeStatsAsync(userStats);
            _logger.LogInformation("Added learned word for user {UserId}, word {WordId}", userId, wordId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding learned word for user {UserId}", userId);
            throw;
        }
    }

    public async Task IncrementTotalQuizzesCompletedAsync(string userId)
    {
        if (!Guid.TryParse(userId, out var userGuid))
        {
            throw new ArgumentException("Invalid user ID format", nameof(userId));
        }

        try
        {
            var userStats = await GetUserChallengeStatsAsync(userId);
            await UpdateUserChallengeStatsAsync(userStats);
            _logger.LogInformation("Incremented total quizzes completed for user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error incrementing total quizzes for user {UserId}", userId);
            throw;
        }
    }
} 