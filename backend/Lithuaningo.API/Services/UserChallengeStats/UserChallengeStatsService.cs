using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.UserChallengeStats;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Threading.Tasks;
using static Supabase.Postgrest.Constants;
using Supabase;
using AutoMapper;

namespace Lithuaningo.API.Services;

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
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
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

    public async Task UpdateUserChallengeStatsAsync(string userId, UpdateUserChallengeStatsRequest request)
    {
        if (!Guid.TryParse(userId, out var userGuid))
        {
            throw new ArgumentException("Invalid user ID format", nameof(userId));
        }

        try
        {
            // Get the current stats DTO to calculate score difference for leaderboard
            var currentStatsDto = await GetUserChallengeStatsAsync(userId);
            
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
            
            // Calculate the number of new correct answers
            int newCorrectAnswers = request.TodayCorrectAnswers - currentStatsDto.TodayCorrectAnswers;
            
            // Update streak logic
            if (isNewDay)
            {
                // If it's a new day, increment current streak
                // and reset today's counters since we're treating this as the first activity of the day
                statsEntity.CurrentStreak = request.CurrentStreak;
                statsEntity.LongestStreak = request.LongestStreak;
                statsEntity.LastChallengeDate = DateTime.UtcNow;
                statsEntity.TodayCorrectAnswerCount = request.TodayCorrectAnswers;
                statsEntity.TodayIncorrectAnswerCount = request.TodayIncorrectAnswers;
            }
            else
            {
                // Same day, just update the values
                statsEntity.CurrentStreak = request.CurrentStreak;
                statsEntity.LongestStreak = request.LongestStreak;
                statsEntity.TodayCorrectAnswerCount = request.TodayCorrectAnswers;
                statsEntity.TodayIncorrectAnswerCount = request.TodayIncorrectAnswers;
            }
            
            statsEntity.TotalChallengesCompleted = request.TotalChallengesCompleted;
            statsEntity.TotalCorrectAnswers = request.TotalCorrectAnswers;
            statsEntity.TotalIncorrectAnswers = request.TotalIncorrectAnswers;
            statsEntity.UpdatedAt = DateTime.UtcNow;

            var updateResponse = await _supabaseClient
                .From<UserChallengeStats>()
                .Where(u => u.Id == statsEntity.Id)
                .Update(statsEntity);

            // Invalidate cache
            await _cacheInvalidator.InvalidateUserChallengeStatsAsync(userId);
            
            // If there are new correct answers, update the leaderboard
            if (newCorrectAnswers > 0)
            {
                // Add points to leaderboard (1 point per correct answer)
                await _leaderboardService.UpdateLeaderboardEntryAsync(userId, newCorrectAnswers);
                _logger.LogInformation("Updated leaderboard for user {UserId} with {Points} points", userId, newCorrectAnswers);
            }
            
            _logger.LogInformation("Updated challenge stats for user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating challenge stats for user {UserId}", userId);
            throw;
        }
    }
    
    public async Task<UserChallengeStatsResponse> CreateUserChallengeStatsAsync(CreateUserChallengeStatsRequest request)
    {
        try
        {
            // Check if stats already exist for the user
            var existingStats = await _supabaseClient
                .From<UserChallengeStats>()
                .Where(u => u.UserId == request.UserId)
                .Get();

            if (existingStats.Models.Any())
            {
                // Instead of throwing an exception, return the existing stats
                _logger.LogInformation("Challenge stats already exist for user {UserId}, returning existing stats", request.UserId);
                var existingStat = existingStats.Models.First();
                var existingStatsResponse = _mapper.Map<UserChallengeStatsResponse>(existingStat);
                // HasCompletedTodayChallenge is now set in the mapper
                
                // Refresh the cache with existing stats
                var existingCacheKey = $"{CacheKeyPrefix}{request.UserId}";
                await _cache.SetAsync(existingCacheKey, existingStatsResponse,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                
                return existingStatsResponse;
            }

            var stats = new UserChallengeStats
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                CurrentStreak = request.CurrentStreak,
                LongestStreak = request.LongestStreak,
                LastChallengeDate = DateTime.UtcNow,
                TodayCorrectAnswerCount = request.TodayCorrectAnswers,
                TodayIncorrectAnswerCount = request.TodayIncorrectAnswers,
                TotalChallengesCompleted = request.TotalChallengesCompleted,
                TotalCorrectAnswers = request.TotalCorrectAnswers,
                TotalIncorrectAnswers = request.TotalIncorrectAnswers,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var createResponse = await _supabaseClient
                .From<UserChallengeStats>()
                .Insert(stats);

            stats = createResponse.Models.First();
            _logger.LogInformation("Created challenge stats for user {UserId}", request.UserId);

            var statsResponse = _mapper.Map<UserChallengeStatsResponse>(stats);
            // HasCompletedTodayChallenge is now set in the mapper

            // Cache the newly created stats
            var cacheKey = $"{CacheKeyPrefix}{request.UserId}";
            await _cache.SetAsync(cacheKey, statsResponse,
                TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));

            return statsResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating challenge stats for user {UserId}", request.UserId);
            throw;
        }
    }
} 