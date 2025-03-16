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
    private const string DeckCachePrefix = "deck:";
    private const string FlashcardCachePrefix = "flashcard:";
    private const string UserCachePrefix = "user:";
    private const string VoteCachePrefix = "vote:";
    private const string ReportCachePrefix = "report:";
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
    /// Invalidates all cache entries related to a specific deck
    /// </summary>
    public async Task InvalidateDeckAsync(string deckId, string userId)
    {
        _logger.LogInformation("Starting cache invalidation for deck {DeckId}", deckId);

        try {
            // Generate all cache keys to invalidate
            var keys = new List<string>
            {
                $"{DeckCachePrefix}{deckId}", // Specific deck
                $"{DeckCachePrefix}list:", // General deck lists
                $"{DeckCachePrefix}top:", // Top rated decks 
                $"{DeckCachePrefix}random:" // Random deck IDs
            };
            
            // User-specific deck cache if userId provided
            if (!string.IsNullOrEmpty(userId))
            {
                keys.Add($"{DeckCachePrefix}user:{userId}");
            }
            
            // Log the keys we're about to invalidate
            _logger.LogInformation("Invalidating the following cache keys: {@Keys}", keys);
            
            // Invalidate all keys in parallel
            var tasks = keys.Select(key => _cache.RemoveByPrefixAsync(key));
            await Task.WhenAll(tasks);
            
            _logger.LogInformation("Successfully completed cache invalidation for deck {DeckId}", deckId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during cache invalidation for deck {DeckId}", deckId);
            throw; // Rethrow to allow calling code to handle the error
        }
    }

    /// <summary>
    /// Invalidates all cache entries related to a specific flashcard
    /// </summary>
    public async Task InvalidateFlashcardAsync(string flashcardId, string deckId)
    {
        _logger.LogInformation("Invalidating cache for flashcard {FlashcardId}", flashcardId);
        
        // Invalidate specific flashcard cache
        await _cache.RemoveByPrefixAsync($"{FlashcardCachePrefix}{flashcardId}");
        
        // Also invalidate deck's flashcard lists
        await _cache.RemoveByPrefixAsync($"{FlashcardCachePrefix}deck:{deckId}");
    }

    /// <summary>
    /// Invalidates all cache entries related to votes on a specific deck
    /// </summary>
    public async Task InvalidateVotesAsync(string deckId, string userId)
    {
        _logger.LogInformation("Invalidating vote cache for deck {DeckId}, user {UserId}", deckId, userId);
        
        // 1. Remove all vote caches related to this deck
        await _cache.RemoveByPrefixAsync($"{VoteCachePrefix}deck:{deckId}");
        
        // 2. Also explicitly remove the user's specific vote cache
        if (!string.IsNullOrEmpty(userId))
        {
            var userVoteKey = $"{VoteCachePrefix}deck:{deckId}:user:{userId}";
            _logger.LogInformation("Explicitly removing user vote cache key: {Key}", userVoteKey);
            await _cache.RemoveAsync(userVoteKey);
        }
        
        // 3. Refresh deck cache as votes affect deck ordering
        await _cache.RemoveByPrefixAsync($"{DeckCachePrefix}{deckId}");
        
        // 4. Explicitly invalidate lists that would include this deck
        await _cache.RemoveByPrefixAsync($"{DeckCachePrefix}list:");
        
        // 5. Explicitly invalidate top-rated decks cache since vote changes directly affect rankings
        _logger.LogInformation("Invalidating cache for top-rated decks");
        await _cache.RemoveByPrefixAsync($"{DeckCachePrefix}top:");
        
        // 6. Consider invalidating any leaderboards or other derivative data
        _logger.LogInformation("Vote cache invalidation complete for deck {DeckId}", deckId);
    }

    /// <summary>
    /// Invalidates all cache entries related to a specific report
    /// </summary>
    public async Task InvalidateReportAsync(string reportId, string deckId, string status)
    {
        _logger.LogInformation("Invalidating cache for report {ReportId}", reportId);
        
        // Invalidate specific report cache
        await _cache.RemoveByPrefixAsync($"{ReportCachePrefix}{reportId}");
        
        // Also invalidate status and deck-specific lists
        await _cache.RemoveByPrefixAsync($"{ReportCachePrefix}status:{status}");
        await _cache.RemoveByPrefixAsync($"{ReportCachePrefix}deck:{deckId}");
        
        // And invalidate pending reports if status is "pending"
        if (status == "pending")
        {
            await _cache.RemoveByPrefixAsync($"{ReportCachePrefix}pending:");
        }
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
    /// Invalidates all cache entries related to deck comments
    /// </summary>
    public async Task InvalidateDeckCommentAsync(string commentId, string deckId, string userId)
    {
        _logger.LogInformation("Invalidating cache for deck comment {CommentId}", commentId);
        
        // Invalidate specific comment cache
        await _cache.RemoveByPrefixAsync($"deck-comment:{commentId}");
        
        // Invalidate deck's comments list
        await _cache.RemoveByPrefixAsync($"deck-comment:deck:{deckId}");
        
        // Invalidate user's comments list
        await _cache.RemoveByPrefixAsync($"deck-comment:user:{userId}");
    }

    /// <summary>
    /// Invalidates all cache entries related to leaderboards
    /// </summary>
    public async Task InvalidateLeaderboardCacheAsync(string weekId)
    {
        _logger.LogInformation("Invalidating cache for leaderboard week {WeekId}", weekId);
        await _cache.RemoveByPrefixAsync($"leaderboard:{weekId}");
        
        // Also invalidate current week cache if needed
        string currentWeekId = DateUtils.GetCurrentWeekPeriod();
        if (weekId != currentWeekId)
        {
            await _cache.RemoveByPrefixAsync($"leaderboard:current");
        }
    }

    /// <summary>
    /// Invalidates all cache entries related to top-rated decks
    /// </summary>
    public async Task InvalidateTopRatedDecksAsync()
    {
        _logger.LogInformation("Invalidating cache for top-rated decks");
        await _cache.RemoveByPrefixAsync($"{DeckCachePrefix}top:");
    }
} 