using AutoMapper;
using Lithuaningo.API.DTOs.Leaderboard;
using Lithuaningo.API.DTOs.UserChallengeStats;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Leaderboard;
using Lithuaningo.API.Services.Supabase;
using Lithuaningo.API.Utilities;
using Supabase;
using Supabase.Postgrest.Models;

namespace Lithuaningo.API.Services.Stats;

/// <summary>
/// Service for managing user challenge statistics
/// </summary>
public class UserChallengeStatsService : IUserChallengeStatsService
{
    private readonly Client _supabaseClient;
    private readonly ILogger<UserChallengeStatsService> _logger;
    private readonly IMapper _mapper;
    private readonly ILeaderboardService _leaderboardService;
    private readonly ICacheService _cache;
    private readonly ICacheSettingsService _cacheSettingsService;
    private readonly CacheInvalidator _cacheInvalidator;
    private const string CacheKeyPrefix = "challenge-stats:";

    public UserChallengeStatsService(
        ISupabaseService supabaseService,
        ILogger<UserChallengeStatsService> logger,
        IMapper mapper,
        ILeaderboardService leaderboardService,
        ICacheService cache,
        ICacheSettingsService cacheSettingsService,
        CacheInvalidator cacheInvalidator)
    {
        _supabaseClient = supabaseService.Client;
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _leaderboardService = leaderboardService;
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        _cacheSettingsService = cacheSettingsService ?? throw new ArgumentNullException(nameof(cacheSettingsService));
        _cacheInvalidator = cacheInvalidator ?? throw new ArgumentNullException(nameof(cacheInvalidator));
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
            var cacheKey = $"{CacheKeyPrefix}{userId}";
            var cachedStats = await _cache.GetAsync<UserChallengeStatsResponse>(cacheKey);

            if (cachedStats != null)
            {
                return cachedStats;
            }

            // Get or create stats entity
            var statsEntity = await GetOrCreateStatsEntityAsync(userGuid);

            // Convert to response DTO
            var statsResponse = _mapper.Map<UserChallengeStatsResponse>(statsEntity);

            // Cache the result
            var settings = await _cacheSettingsService.GetCacheSettingsAsync();
            await _cache.SetAsync(cacheKey, statsResponse, TimeSpan.FromMinutes(settings.DefaultExpirationMinutes));

            return statsResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving challenge stats");
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
            // Get or create stats entity
            var statsEntity = await GetOrCreateStatsEntityAsync(userGuid);

            // Always update the last challenge date to today
            statsEntity.LastChallengeDate = DateTime.UtcNow;

            // Update the stats based on the challenge answer
            UpdateStatsForChallengeAnswer(statsEntity, request.WasCorrect);

            // Save updates back to database
            statsEntity = await SaveStatsEntityAsync(statsEntity);

            // Invalidate the cache
            await _cacheInvalidator.InvalidateUserChallengeStatsAsync(userId);

            // Update leaderboard if answer was correct
            if (request.WasCorrect)
            {
                // Add 1 point to leaderboard per correct answer
                await _leaderboardService.UpdateLeaderboardEntryAsync(new UpdateLeaderboardEntryRequest { UserId = userGuid, ScoreToAdd = 1 });
            }

            // Convert to response DTO
            var updatedStatsResponse = _mapper.Map<UserChallengeStatsResponse>(statsEntity);

            return updatedStatsResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting challenge answer");
            throw;
        }
    }

    #region Private Helper Methods

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
            return stats;
        }

        // Create default stats if none exist
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

        if (createResponse.Models == null || createResponse.Models.Count == 0)
        {
            throw new InvalidOperationException("Failed to create challenge stats");
        }

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

        // Check if it's a new day
        bool isNewDay = lastChallengeDateUtc < currentDateUtc;

        if (isNewDay)
        {
            // Reset today's counters and increment streak on new day
            stats.TodayCorrectAnswerCount = 0;
            stats.TodayIncorrectAnswerCount = 0;
            stats.CurrentStreak += 1;

            // Increment challenges completed counter for a new day
            stats.TotalChallengesCompleted += 1;
        }
        else if (stats.TodayCorrectAnswerCount + stats.TodayIncorrectAnswerCount == 0)
        {
            // First challenge of the day
            stats.TotalChallengesCompleted += 1;
        }

        // Update longest streak if needed
        if (stats.CurrentStreak > stats.LongestStreak)
        {
            stats.LongestStreak = stats.CurrentStreak;
        }

        // Update answer counts
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
        var updateResponse = await _supabaseClient
            .From<UserChallengeStats>()
            .Where(u => u.Id == statsEntity.Id)
            .Update(statsEntity);

        if (updateResponse.Models == null || updateResponse.Models.Count == 0)
        {
            throw new InvalidOperationException("Failed to update challenge stats");
        }

        return updateResponse.Models.First();
    }

    #endregion
}