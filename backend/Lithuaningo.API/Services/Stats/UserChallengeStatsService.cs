using AutoMapper;
using Lithuaningo.API.DTOs.UserChallengeStats;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Leaderboard;
using Lithuaningo.API.Services.Supabase;
using Microsoft.Extensions.Options;
using Supabase;

namespace Lithuaningo.API.Services.Stats;

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

    public async Task<UserChallengeStatsResponse> GetUserChallengeStatsAsync(string userId)
    {
        if (!Guid.TryParse(userId, out var userGuid))
        {
            throw new ArgumentException("Invalid user ID format", nameof(userId));
        }

        var cacheKey = $"{CacheKeyPrefix}{userGuid}";
        var cached = await _cache.GetAsync<UserChallengeStatsResponse>(cacheKey);

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
                    TodayCorrectAnswerCount = 0,
                    TodayIncorrectAnswerCount = 0,
                    TotalChallengesCompleted = 0,
                    TotalCorrectAnswers = 0,
                    TotalIncorrectAnswers = 0,
                };

                var createResponse = await _supabaseClient
                    .From<UserChallengeStats>()
                    .Insert(stats);

                stats = createResponse.Models.First();
                _logger.LogInformation("Created new challenge stats for user {UserId}", userId);
            }

            var statsResponse = _mapper.Map<UserChallengeStatsResponse>(stats);
            // HasCompletedTodayChallenge is now set in the mapper

            await _cache.SetAsync(cacheKey, statsResponse,
                TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
            _logger.LogInformation("Retrieved and cached challenge stats for user {UserId}", userId);

            return statsResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving challenge stats for user {UserId}", userId);
            throw;
        }
    }

    public async Task<UserChallengeStatsResponse> SubmitChallengeAnswerAsync(string userId, SubmitChallengeAnswerRequest request)
    {
        if (!Guid.TryParse(userId, out var userGuid))
        {
            throw new ArgumentException("Invalid user ID format", nameof(userId));
        }

        try
        {
            // Get current stats
            var currentStatsResponse = await GetUserChallengeStatsAsync(userId);

            // Get the entity from the database for updating
            var databaseResponse = await _supabaseClient
                .From<UserChallengeStats>()
                .Where(u => u.UserId == userGuid)
                .Get();

            var statsEntity = databaseResponse.Models.FirstOrDefault();
            if (statsEntity == null)
            {
                throw new InvalidOperationException($"No stats found for user {userId}");
            }

            bool isNewDay = statsEntity.LastChallengeDate.Date != DateTime.UtcNow.Date;

            // Handle streak calculation
            if (isNewDay)
            {
                // It's a new day
                statsEntity.CurrentStreak += 1;
                statsEntity.LastChallengeDate = DateTime.UtcNow;

                // Reset today's counters since it's a new day
                statsEntity.TodayCorrectAnswerCount = 0;
                statsEntity.TodayIncorrectAnswerCount = 0;
            }

            // Update longest streak if needed
            if (statsEntity.CurrentStreak > statsEntity.LongestStreak)
            {
                statsEntity.LongestStreak = statsEntity.CurrentStreak;
            }

            // Update answer counts based on whether the answer was correct
            if (request.WasCorrect)
            {
                statsEntity.TodayCorrectAnswerCount += 1;
                statsEntity.TotalCorrectAnswers += 1;
            }
            else
            {
                statsEntity.TodayIncorrectAnswerCount += 1;
                statsEntity.TotalIncorrectAnswers += 1;
            }

            // Increment total challenges completed
            statsEntity.TotalChallengesCompleted += 1;

            // Update the stats in the database
            var updateResponse = await _supabaseClient
                .From<UserChallengeStats>()
                .Where(u => u.Id == statsEntity.Id)
                .Update(statsEntity);

            // Invalidate cache
            await _cacheInvalidator.InvalidateUserChallengeStatsAsync(userId);

            // If the answer was correct, update the leaderboard
            if (request.WasCorrect)
            {
                // Add 1 point to leaderboard per correct answer
                await _leaderboardService.UpdateLeaderboardEntryAsync(userId, 1);
                _logger.LogInformation("Updated leaderboard for user {UserId} with 1 point", userId);
            }

            _logger.LogInformation("Updated challenge stats for user {UserId} after challenge {ChallengeId}",
                userId, request.ChallengeId);

            // Get and return the updated stats
            return await GetUserChallengeStatsAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting challenge answer for user {UserId}", userId);
            throw;
        }
    }
}