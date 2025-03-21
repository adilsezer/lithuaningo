using Microsoft.Extensions.Logging;
using Lithuaningo.API.Utilities;

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
    private const string AnnouncementCachePrefix = "announcement:";
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
        _logger.LogInformation("Invalidating cache for flashcard {FlashcardId}", flashcardId);
        
        // Invalidate specific flashcard cache
        await _cache.RemoveByPrefixAsync($"{FlashcardCachePrefix}{flashcardId}");
    }

    /// <summary>
    /// Invalidates all cache entries related to announcements
    /// </summary>
    public async Task InvalidateAnnouncementsAsync(string? announcementId = null)
    {
        if (!string.IsNullOrEmpty(announcementId))
        {
            _logger.LogInformation("Invalidating cache for announcement {AnnouncementId}", announcementId);
            await _cache.RemoveByPrefixAsync($"{AnnouncementCachePrefix}{announcementId}");
        }
        
        // Always invalidate the list of all announcements
        await _cache.RemoveByPrefixAsync($"{AnnouncementCachePrefix}all");
    }

    /// <summary>
    /// Invalidates all cache entries related to app info for a specific platform
    /// </summary>
    public async Task InvalidateAppInfoAsync(string platform)
    {
        _logger.LogInformation("Invalidating cache for app info, platform {Platform}", platform);
        await _cache.RemoveByPrefixAsync($"{AppInfoCachePrefix}{platform}");
    }

    /// <summary>
    /// Invalidates all cache entries related to a specific user profile
    /// </summary>
    public async Task InvalidateUserProfileAsync(string userId)
    {
        _logger.LogInformation("Invalidating cache for user profile {UserId}", userId);
        await _cache.RemoveByPrefixAsync($"{UserCachePrefix}{userId}");
    }

    /// <summary>
    /// Invalidates all cache entries related to user challenge stats
    /// </summary>
    public async Task InvalidateUserChallengeStatsAsync(string userId)
    {
        _logger.LogInformation("Invalidating cache for user challenge stats, user {UserId}", userId);
        await _cache.RemoveByPrefixAsync($"challenge-stats:{userId}");
    }

    /// <summary>
    /// Invalidates all cache entries related to challenge questions
    /// </summary>
    public async Task InvalidateChallengeCacheAsync(string? category = null)
    {
        if (!string.IsNullOrEmpty(category))
        {
            _logger.LogInformation("Invalidating cache for challenge category {Category}", category);
            await _cache.RemoveByPrefixAsync($"challenge:category:{category.ToLowerInvariant()}");
        }
        else
        {
            _logger.LogInformation("Invalidating all challenge cache");
            await _cache.RemoveByPrefixAsync("challenge:");
        }
    }

    /// <summary>
    /// Invalidates all cache entries related to leaderboards
    /// </summary>
    public async Task InvalidateLeaderboardCacheAsync(string weekId)
    {
        _logger.LogInformation("Invalidating cache for leaderboard week {WeekId}", weekId);
        await _cache.RemoveByPrefixAsync($"leaderboard:week:{weekId}");
        
        // Also invalidate current week cache if needed
        string currentWeekId = DateUtils.GetCurrentWeekPeriod();
        if (weekId == currentWeekId)
        {
            _logger.LogInformation("Invalidating current week leaderboard cache");
            await _cache.RemoveByPrefixAsync($"leaderboard:current");
        }
        
        // Also clear any other leaderboard caches
        await _cache.RemoveByPrefixAsync($"leaderboard:");
    }
} 