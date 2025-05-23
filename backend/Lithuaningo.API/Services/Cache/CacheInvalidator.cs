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

    public CacheInvalidator(
        ICacheService cache,
        ILogger<CacheInvalidator> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    /// <summary>
    /// Invalidates all cache entries related to a specific flashcard
    /// </summary>
    public async Task InvalidateFlashcardAsync(string flashcardId)
    {
        await InvalidateCacheKeyAsync($"{FlashcardCachePrefix}id:{flashcardId}");
    }

    /// <summary>
    /// Invalidates all flashcard caches related to a specific category
    /// </summary>
    /// <param name="category">The category identifier</param>
    public async Task InvalidateAllFlashcardCachesForCategoryAsync(int category)
    {
        // Invalidate category-based caches (all difficulties)
        await InvalidateCacheKeyAsync($"{FlashcardCachePrefix}category:{category}");

        // Invalidate front texts cache for this category
        await InvalidateCacheKeyAsync($"{FlashcardCachePrefix}front-texts:category:{category}");
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
        await InvalidateCacheKeyAsync($"challenge-stats:{userId}");
    }

    /// <summary>
    /// Invalidates all cache entries related to challenge questions
    /// </summary>
    public async Task InvalidateChallengeCacheAsync(string? category = null)
    {
        if (!string.IsNullOrEmpty(category))
        {
            await InvalidateCacheKeyAsync($"challenge:category:{category.ToLowerInvariant()}");
        }
        else
        {
            await _cache.RemoveByPrefixAsync("challenge:");
            // No specific key to remove when clearing all challenges
        }
    }

    /// <summary>
    /// Invalidates all cache entries related to leaderboards
    /// </summary>
    public async Task InvalidateLeaderboardCacheAsync(string weekId)
    {
        await InvalidateCacheKeyAsync($"leaderboard:week:{weekId}");

        // Handle current week cache invalidation
        string currentWeekId = DateUtils.GetCurrentWeekPeriod();
        if (weekId == currentWeekId)
        {
            await InvalidateCacheKeyAsync("leaderboard:current");
        }
    }

    /// <summary>
    /// Invalidates all cache entries related to user chat stats
    /// </summary>
    public async Task InvalidateUserChatStatsAsync(string userId)
    {
        await InvalidateCacheKeyAsync($"chat-stats:{userId}");
    }

    /// <summary>
    /// Invalidates all cache entries related to user flashcard stats
    /// </summary>
    public async Task InvalidateUserFlashcardStatsAsync(string userId)
    {
        // Invalidate the main flashcard stats cache
        await InvalidateCacheKeyAsync($"flashcard-stats:{userId}");

        // Also invalidate the summary cache
        await InvalidateCacheKeyAsync($"flashcard-stats-summary:{userId}");
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