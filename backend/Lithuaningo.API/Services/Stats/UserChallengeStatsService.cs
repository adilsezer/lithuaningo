using AutoMapper;
using Lithuaningo.API.DTOs.UserChallengeStats;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Leaderboard;
using Lithuaningo.API.Services.Supabase;
using Microsoft.Extensions.Options;
using Supabase;
using Supabase.Postgrest.Models;

namespace Lithuaningo.API.Services.Stats;

/// <summary>
/// Service for managing user challenge statistics
/// </summary>
public class UserChallengeStatsService : IUserChallengeStatsService
{
    private readonly Client _supabaseClient;
    private readonly ICacheService _cache;
    private readonly CacheSettings _cacheSettings;
    private const string CacheKeyPrefix = "challenge-stats:";
    private readonly ILogger<UserChallengeStatsService> _logger;
    private readonly IMapper _mapper;
    private readonly CacheInvalidator _cacheInvalidator;
    private readonly ILeaderboardService _leaderboardService;

    public UserChallengeStatsService(
        ISupabaseService supabaseService,
        ICacheService cache,
        IOptions<CacheSettings> cacheSettings,
        ILogger<UserChallengeStatsService> logger,
        IMapper mapper,
        CacheInvalidator cacheInvalidator,
        ILeaderboardService leaderboardService)
    {
        _supabaseClient = supabaseService.Client;
        _cache = cache;
        _cacheSettings = cacheSettings.Value;
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _cacheInvalidator = cacheInvalidator ?? throw new ArgumentNullException(nameof(cacheInvalidator));
        _leaderboardService = leaderboardService;
    }

    /// <summary>
    /// Gets a user's challenge statistics or creates default stats if none exist
    /// </summary>
    public async Task<UserChallengeStatsResponse> GetUserChallengeStatsAsync(string userId)
    {
        if (!Guid.TryParse(userId, out var userGuid))
        {
            throw new ArgumentException("Invalid user ID format", nameof(userId));
        }

        try
        {
            // Try to get from cache first
            var statsResponse = await GetFromCacheAsync(userGuid);
            if (statsResponse != null)
            {
                return statsResponse;
            }

            // Get or create stats entity
            var statsEntity = await GetOrCreateStatsEntityAsync(userGuid);

            // Convert to response DTO
            statsResponse = _mapper.Map<UserChallengeStatsResponse>(statsEntity);

            // Cache the response
            await SaveStatsToCacheAsync(userGuid, statsResponse);

            return statsResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving challenge stats for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Submits a challenge answer and updates all related statistics
    /// </summary>
    public async Task<UserChallengeStatsResponse> SubmitChallengeAnswerAsync(string userId, SubmitChallengeAnswerRequest request)
    {
        if (!Guid.TryParse(userId, out var userGuid))
        {
            throw new ArgumentException("Invalid user ID format", nameof(userId));
        }

        try
        {
            _logger.LogInformation("Processing challenge answer for user {UserId}, challenge {ChallengeId}, correct: {WasCorrect}",
                userId, request.ChallengeId, request.WasCorrect);

            // Get or create stats entity
            var statsEntity = await GetOrCreateStatsEntityAsync(userGuid);

            // Log current date info for debugging
            _logger.LogInformation("Date comparison - Last challenge: {LastDate}, Current: {CurrentDate}",
                statsEntity.LastChallengeDate.ToString("yyyy-MM-dd"), DateTime.UtcNow.ToString("yyyy-MM-dd"));

            // Update the stats based on the challenge answer
            UpdateStatsForChallengeAnswer(statsEntity, request.WasCorrect);

            // Save updates back to database
            statsEntity = await SaveStatsEntityAsync(statsEntity);

            // Invalidate cache since stats have changed
            await _cacheInvalidator.InvalidateUserChallengeStatsAsync(userId);

            // Update leaderboard if answer was correct
            if (request.WasCorrect)
            {
                // Add 1 point to leaderboard per correct answer
                await _leaderboardService.UpdateLeaderboardEntryAsync(userId, 1);
                _logger.LogInformation("Updated leaderboard for user {UserId} with 1 point", userId);
            }

            // Convert to response DTO
            var updatedStatsResponse = _mapper.Map<UserChallengeStatsResponse>(statsEntity);

            // Set calculated fields and cache result
            updatedStatsResponse.HasCompletedTodayChallenge = statsEntity.TodayCorrectAnswerCount + statsEntity.TodayIncorrectAnswerCount >= 10;
            updatedStatsResponse.TotalChallengesCompleted += updatedStatsResponse.HasCompletedTodayChallenge ? 1 : 0;
            await SaveStatsToCacheAsync(userGuid, updatedStatsResponse);

            _logger.LogInformation("Successfully updated challenge stats for user {UserId}, total challenges: {Total}",
                userId, statsEntity.TotalChallengesCompleted);

            return updatedStatsResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting challenge answer for user {UserId}: {ErrorMessage}", userId, ex.Message);
            throw;
        }
    }

    #region Private Helper Methods

    /// <summary>
    /// Attempts to get challenge stats from cache
    /// </summary>
    private async Task<UserChallengeStatsResponse?> GetFromCacheAsync(Guid userGuid)
    {
        var cacheKey = $"{CacheKeyPrefix}{userGuid}";
        var cached = await _cache.GetAsync<UserChallengeStatsResponse>(cacheKey);

        if (cached != null)
        {
            _logger.LogInformation("Retrieved challenge stats from cache for user {UserId}", userGuid);
        }

        return cached;
    }

    /// <summary>
    /// Stores user challenge statistics in the cache with appropriate expiration
    /// </summary>
    private async Task SaveStatsToCacheAsync(Guid userGuid, UserChallengeStatsResponse statsResponse)
    {
        var cacheKey = $"{CacheKeyPrefix}{userGuid}";
        await _cache.SetAsync(cacheKey, statsResponse, TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
        _logger.LogInformation("Cached challenge stats for user {UserId}", userGuid);
    }

    /// <summary>
    /// Gets existing stats entity or creates a new one if none exists
    /// </summary>
    private async Task<UserChallengeStats> GetOrCreateStatsEntityAsync(Guid userGuid)
    {
        var response = await _supabaseClient
            .From<UserChallengeStats>()
            .Where(u => u.UserId == userGuid)
            .Get();

        var stats = response.Models.FirstOrDefault();
        if (stats != null)
        {
            _logger.LogInformation("Found existing stats for user {UserId}", userGuid);
            return stats;
        }

        // Create default stats if none exist
        _logger.LogInformation("No stats found for user {UserId}, creating new record", userGuid);
        var newStats = new UserChallengeStats
        {
            Id = Guid.NewGuid(),
            UserId = userGuid,
            CurrentStreak = 0,
            LongestStreak = 0,
            LastChallengeDate = DateTime.UtcNow,
            TodayCorrectAnswerCount = 0,
            TodayIncorrectAnswerCount = 0,
            TotalChallengesCompleted = 0,
            TotalCorrectAnswers = 0,
            TotalIncorrectAnswers = 0,
        };

        var createResponse = await _supabaseClient
            .From<UserChallengeStats>()
            .Insert(newStats);

        if (createResponse.Models == null || !createResponse.Models.Any())
        {
            throw new InvalidOperationException($"Failed to create stats for user {userGuid}");
        }

        _logger.LogInformation("Created new challenge stats for user {UserId}", userGuid);
        return createResponse.Models.First();
    }

    /// <summary>
    /// Updates stats entity based on a challenge answer
    /// </summary>
    private void UpdateStatsForChallengeAnswer(UserChallengeStats stats, bool wasCorrect)
    {
        // Get current date in UTC
        DateTime currentDateUtc = DateTime.UtcNow.Date;
        // Convert LastChallengeDate to date only for comparison
        DateTime lastChallengeDateUtc = stats.LastChallengeDate.Date;

        // Check if it's a new day by comparing dates without time
        bool isNewDay = lastChallengeDateUtc < currentDateUtc;

        if (isNewDay)
        {
            _logger.LogInformation("New day detected for user {UserId}, last challenge: {LastDate}, current date: {CurrentDate}",
                stats.UserId, lastChallengeDateUtc.ToString("yyyy-MM-dd"), currentDateUtc.ToString("yyyy-MM-dd"));

            // It's a new day
            stats.CurrentStreak += 1;
            stats.LastChallengeDate = DateTime.UtcNow;

            // Reset today's counters since it's a new day
            stats.TodayCorrectAnswerCount = 0;
            stats.TodayIncorrectAnswerCount = 0;
        }
        else
        {
            _logger.LogInformation("Same day activity for user {UserId}, last challenge: {LastDate}, current date: {CurrentDate}",
                stats.UserId, lastChallengeDateUtc.ToString("yyyy-MM-dd"), currentDateUtc.ToString("yyyy-MM-dd"));
        }

        // Update longest streak if needed
        if (stats.CurrentStreak > stats.LongestStreak)
        {
            _logger.LogInformation("New longest streak for user {UserId}: {NewStreak}",
                stats.UserId, stats.CurrentStreak);
            stats.LongestStreak = stats.CurrentStreak;
        }

        // Update answer counts based on whether the answer was correct
        if (wasCorrect)
        {
            stats.TodayCorrectAnswerCount += 1;
            stats.TotalCorrectAnswers += 1;
        }
        else
        {
            stats.TodayIncorrectAnswerCount += 1;
            stats.TotalIncorrectAnswers += 1;
        }
    }

    /// <summary>
    /// Saves an updated stats entity to the database
    /// </summary>
    private async Task<UserChallengeStats> SaveStatsEntityAsync(UserChallengeStats statsEntity)
    {
        _logger.LogInformation("Saving challenge stats for user {UserId}, ID: {StatId}",
            statsEntity.UserId, statsEntity.Id);

        var updateResponse = await _supabaseClient
            .From<UserChallengeStats>()
            .Where(u => u.Id == statsEntity.Id)
            .Update(statsEntity);

        if (updateResponse.Models == null || !updateResponse.Models.Any())
        {
            throw new InvalidOperationException($"Failed to update stats for user {statsEntity.UserId}");
        }

        return updateResponse.Models.First();
    }

    #endregion
}