using AutoMapper;
using Lithuaningo.API.DTOs.Leaderboard;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Supabase;
using Lithuaningo.API.Utilities;
using Microsoft.Extensions.Options;
using Supabase;
using static Supabase.Postgrest.Constants;
namespace Lithuaningo.API.Services.Leaderboard
{
    public class LeaderboardService : ILeaderboardService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "leaderboard:";
        private readonly ILogger<LeaderboardService> _logger;
        private readonly IMapper _mapper;
        private const int LEADERBOARD_SIZE = 20;
        private readonly CacheInvalidator _cacheInvalidator;

        public LeaderboardService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<LeaderboardService> logger,
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

        public async Task<List<LeaderboardEntryResponse>> GetCurrentWeekLeaderboardAsync()
        {
            try
            {
                var currentWeek = DateUtils.GetCurrentWeekPeriod();

                // Use a dedicated current week cache key
                var cacheKey = $"{CacheKeyPrefix}current";
                var cached = await _cache.GetAsync<List<LeaderboardEntryResponse>>(cacheKey);

                if (cached != null)
                {
                    _logger.LogInformation("Retrieved current week leaderboard from cache for week {WeekId}", currentWeek);
                    return cached;
                }

                // Get the actual data
                var leaderboard = await GetWeekLeaderboardAsync(currentWeek);

                // Cache under the current week key as well
                await _cache.SetAsync(cacheKey, leaderboard,
                    TimeSpan.FromMinutes(_cacheSettings.LeaderboardCacheMinutes));

                _logger.LogInformation("Cached current week leaderboard for week {WeekId}", currentWeek);

                return leaderboard;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current week leaderboard");
                throw;
            }
        }

        public async Task<List<LeaderboardEntryResponse>> GetWeekLeaderboardAsync(string weekId)
        {
            if (string.IsNullOrWhiteSpace(weekId))
            {
                throw new ArgumentException("Week ID cannot be empty", nameof(weekId));
            }

            var cacheKey = $"{CacheKeyPrefix}week:{weekId}";
            var cached = await _cache.GetAsync<List<LeaderboardEntryResponse>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved leaderboard from cache for week {WeekId}", weekId);
                return cached;
            }

            try
            {
                var entriesResponse = await _supabaseClient
                    .From<LeaderboardEntry>()
                    .Select("*")
                    .Where(l => l.WeekId == weekId)
                    .Order("score", Ordering.Descending)
                    .Limit(LEADERBOARD_SIZE)
                    .Get();

                var mappedEntries = _mapper.Map<List<LeaderboardEntryResponse>>(entriesResponse.Models);

                await _cache.SetAsync(cacheKey, mappedEntries,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));

                _logger.LogInformation("Retrieved and cached leaderboard for week {WeekId} with {Count} entries",
                    weekId, entriesResponse.Models.Count);

                return mappedEntries;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving leaderboard for week {WeekId}", weekId);
                throw;
            }
        }

        public async Task<LeaderboardEntryResponse> UpdateLeaderboardEntryAsync(string userId, int score)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            if (score < 0)
            {
                throw new ArgumentException("Points to add cannot be negative", nameof(score));
            }

            var currentWeek = DateUtils.GetCurrentWeekPeriod();

            try
            {
                // Get user info to verify user exists
                var userResponse = await _supabaseClient
                    .From<Models.UserProfile>()
                    .Where(u => u.Id == userGuid)
                    .Single();

                if (userResponse == null)
                {
                    throw new InvalidOperationException($"User {userId} not found");
                }

                // Try to find an existing entry for this user in the current week
                var existingResponse = await _supabaseClient
                    .From<LeaderboardEntry>()
                    .Where(l => l.UserId == userGuid)
                    .Where(l => l.WeekId == currentWeek)
                    .Single();

                LeaderboardEntry updatedEntry;
                if (existingResponse != null)
                {
                    // Update existing entry by adding the new score to the existing score
                    var response = await _supabaseClient
                        .From<LeaderboardEntry>()
                        .Where(l => l.Id == existingResponse.Id)
                        .Set(l => l.Score, existingResponse.Score + score)
                        .Update();

                    updatedEntry = response.Models.First();
                    _logger.LogInformation("Updated leaderboard entry {Id} for user {UserId}, added {Score} points",
                        updatedEntry.Id, userId, score);
                }
                else
                {
                    // Create new entry starting with the initial score
                    var newEntry = new LeaderboardEntry
                    {
                        Id = Guid.NewGuid(),
                        UserId = userGuid,
                        WeekId = currentWeek,
                        Score = score, // Initial score for new entry
                    };

                    var response = await _supabaseClient
                        .From<LeaderboardEntry>()
                        .Insert(newEntry);

                    updatedEntry = response.Models.First();
                    _logger.LogInformation("Created new leaderboard entry {Id} for user {UserId} with initial score {Score}",
                        updatedEntry.Id, userId, score);
                }

                // Map to response DTO
                var dto = _mapper.Map<LeaderboardEntryResponse>(updatedEntry);
                dto.Username = userResponse.FullName ?? "Unknown User";

                // Invalidate cache since leaderboard has changed
                await InvalidateLeaderboardCacheAsync(currentWeek);

                return dto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating leaderboard entry for user {UserId}", userId);
                throw;
            }
        }

        private async Task InvalidateLeaderboardCacheAsync(string weekId)
        {
            await _cacheInvalidator.InvalidateLeaderboardCacheAsync(weekId);
        }
    }
}
