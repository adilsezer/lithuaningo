using Lithuaningo.API.Utilities;
using Microsoft.Extensions.Logging;

namespace Lithuaningo.API.Services.Cache;

/// <summary>
/// Helper class to centralize common cache invalidation patterns
/// </summary>
public class CacheInvalidator
{
    private readonly ICacheService _cache;
    private readonly ILogger<CacheInvalidator> _logger;

    // Prefixes used for different entity types
    private const string FlashcardCachePrefix = "flashcard:";
    private const string UserCachePrefix = "user:";
    private const string AppInfoCachePrefix = "appinfo:";
    private const string ChallengeStatsCachePrefix = "challenge-stats:";
    private const string LeaderboardCachePrefix = "leaderboard:";
    private const string ChatStatsCachePrefix = "chat-stats:";
    private const string UserFlashcardStatsCachePrefix = "flashcard-stats:";
    private const string UserFlashcardStatsSummaryCachePrefix = "flashcard-stats-summary:";

    public CacheInvalidator(
        ICacheService cache,
        ILogger<CacheInvalidator> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    /// <summary>
    /// Invalidates all cache entries related to app info for a specific platform
    /// </summary>
    public async Task InvalidateAppInfoAsync(string platform)
    {
        await InvalidateCacheKeyAsync($"{AppInfoCachePrefix}{platform}");
    }

    /// <summary>
    /// Invalidates all cache entries related to a specific user profile
    /// </summary>
    public async Task InvalidateUserProfileAsync(string userId)
    {
        await InvalidateCacheKeyAsync($"{UserCachePrefix}{userId}");
    }

    /// <summary>
    /// Invalidates all cache entries related to user challenge stats
    /// </summary>
    public async Task InvalidateUserChallengeStatsAsync(string userId)
    {
        await InvalidateCacheKeyAsync($"{ChallengeStatsCachePrefix}{userId}");
    }

    /// <summary>
    /// Invalidates all cache entries related to leaderboards
    /// </summary>
    public async Task InvalidateLeaderboardCacheAsync(string weekId)
    {
        await InvalidateCacheKeyAsync($"{LeaderboardCachePrefix}week:{weekId}");

        // Handle current week cache invalidation
        string currentWeekId = DateUtils.GetCurrentWeekPeriod();
        if (weekId == currentWeekId)
        {
            await InvalidateCacheKeyAsync($"{LeaderboardCachePrefix}current");
        }
    }

    /// <summary>
    /// Invalidates all cache entries related to user chat stats
    /// </summary>
    public async Task InvalidateUserChatStatsAsync(string userId)
    {
        await InvalidateCacheKeyAsync($"{ChatStatsCachePrefix}{userId}");
    }

    /// <summary>
    /// Invalidates all cache entries related to user flashcard stats
    /// </summary>
    public async Task InvalidateUserFlashcardStatsAsync(string userId)
    {
        // Invalidate the main flashcard stats cache
        await InvalidateCacheKeyAsync($"{UserFlashcardStatsCachePrefix}{userId}");

        // Also invalidate the summary cache
        await InvalidateCacheKeyAsync($"{UserFlashcardStatsSummaryCachePrefix}{userId}");
    }

    /// <summary>
    /// Aggressively invalidates all cache entries related to flashcard lists.
    /// This is typically used after AI generation or significant updates.
    /// </summary>
    public async Task InvalidateAllFlashcardListsAsync()
    {
        await _cache.RemoveByPrefixAsync(FlashcardCachePrefix);
    }

    /// <summary>
    /// Helper method to invalidate a cache key using both prefix-based and direct key removal
    /// </summary>
    private async Task InvalidateCacheKeyAsync(string cacheKey)
    {
        // Use both prefix-based removal and direct key removal for robust invalidation
        await _cache.RemoveByPrefixAsync(cacheKey);
        await _cache.RemoveAsync(cacheKey);
    }
}