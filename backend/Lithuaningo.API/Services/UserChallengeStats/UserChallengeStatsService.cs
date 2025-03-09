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

    public UserChallengeStatsService(
        ISupabaseService supabaseService,
        ICacheService cache,
        IOptions<CacheSettings> cacheSettings,
        ILogger<UserChallengeStatsService> logger,
        IMapper mapper,
        CacheInvalidator cacheInvalidator)
    {
        _supabaseClient = supabaseService.Client;
        _cache = cache;
        _cacheSettings = cacheSettings.Value;
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _cacheInvalidator = cacheInvalidator ?? throw new ArgumentNullException(nameof(cacheInvalidator));
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
            statsResponse.HasCompletedTodayChallenge = stats.LastChallengeDate.Date == DateTime.UtcNow.Date;

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
            var existingStats = await _supabaseClient
                .From<UserChallengeStats>()
                .Where(u => u.UserId == userGuid)
                .Get();

            var stats = existingStats.Models.FirstOrDefault();
            if (stats == null)
            {
                throw new InvalidOperationException($"No stats found for user {userId}");
            }

            stats.CurrentStreak = request.CurrentStreak;
            stats.LongestStreak = request.LongestStreak;
            stats.TodayCorrectAnswerCount = request.TodayCorrectAnswers;
            stats.TodayIncorrectAnswerCount = request.TodayIncorrectAnswers;
            stats.TotalChallengesCompleted = request.TotalChallengesCompleted;
            stats.TotalCorrectAnswers = request.TotalCorrectAnswers;
            stats.TotalIncorrectAnswers = request.TotalIncorrectAnswers;
            stats.UpdatedAt = DateTime.UtcNow;

            var response = await _supabaseClient
                .From<UserChallengeStats>()
                .Where(u => u.Id == stats.Id)
                .Update(stats);

            // Invalidate cache
            await _cacheInvalidator.InvalidateUserChallengeStatsAsync(userId);
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
                existingStatsResponse.HasCompletedTodayChallenge = existingStat.LastChallengeDate.Date == DateTime.UtcNow.Date;
                
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
            statsResponse.HasCompletedTodayChallenge = stats.LastChallengeDate.Date == DateTime.UtcNow.Date;

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