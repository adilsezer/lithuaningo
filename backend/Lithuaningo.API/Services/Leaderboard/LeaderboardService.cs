using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.Leaderboard;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.Utilities;
using static Supabase.Postgrest.Constants;
using Supabase;
using AutoMapper;

namespace Lithuaningo.API.Services
{
    public class LeaderboardService : ILeaderboardService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "leaderboard:";
        private readonly ILogger<LeaderboardService> _logger;
        private readonly IMapper _mapper;

        public LeaderboardService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<LeaderboardService> logger,
            IMapper mapper)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<LeaderboardWeekResponse> GetCurrentWeekLeaderboardAsync()
        {
            try
            {
                var currentWeek = DateUtils.GetCurrentWeekPeriod();
                return await GetWeekLeaderboardAsync(currentWeek);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current week leaderboard");
                throw;
            }
        }

        public async Task<LeaderboardWeekResponse> GetWeekLeaderboardAsync(string weekId)
        {
            if (string.IsNullOrWhiteSpace(weekId))
            {
                throw new ArgumentException("Week ID cannot be empty", nameof(weekId));
            }

            var cacheKey = $"{CacheKeyPrefix}week:{weekId}";
            var cached = await _cache.GetAsync<LeaderboardWeekResponse>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved leaderboard from cache for week {WeekId}", weekId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<LeaderboardWeek>()
                    .Filter(l => l.Id.ToString(), Operator.Equals, weekId)
                    .Get();

                var leaderboardWeek = response.Models.FirstOrDefault();
                if (leaderboardWeek == null)
                {
                    var (startDate, endDate) = DateUtils.GetWeekDates(weekId);
                    leaderboardWeek = new LeaderboardWeek
                    {
                        Id = Guid.NewGuid(),
                        StartDate = startDate,
                        EndDate = endDate,
                        Entries = new Dictionary<string, LeaderboardEntry>()
                    };

                    var createResponse = await _supabaseClient
                        .From<LeaderboardWeek>()
                        .Insert(leaderboardWeek);
                    
                    leaderboardWeek = createResponse.Models.First();
                }

                var leaderboardResponse = _mapper.Map<LeaderboardWeekResponse>(leaderboardWeek);

                await _cache.SetAsync(cacheKey, leaderboardResponse,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached leaderboard for week {WeekId} with {Count} entries", 
                    weekId, leaderboardWeek.Entries.Count);

                return leaderboardResponse;
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
                throw new ArgumentException("Score cannot be negative", nameof(score));
            }

            var currentWeek = DateUtils.GetCurrentWeekPeriod();

            try
            {
                // Try to find an existing entry for this user in the current week.
                var existingResponse = await _supabaseClient
                    .From<LeaderboardEntry>()
                    .Filter(l => l.UserId, Operator.Equals, userGuid)
                    .Get();

                var existing = existingResponse.Models.FirstOrDefault();
                LeaderboardEntry updatedEntry;

                if (existing != null)
                {
                    // Update the existing entry.
                    existing.Score = score;
                    existing.UpdatedAt = DateTime.UtcNow;

                    var response = await _supabaseClient
                        .From<LeaderboardEntry>()
                        .Where(l => l.Id == existing.Id)
                        .Update(existing);

                    updatedEntry = response.Models.First();
                    _logger.LogInformation("Updated leaderboard entry {Id} for user {UserId}", 
                        updatedEntry.Id, userId);
                }
                else
                {
                    // Create a new entry.
                    var newEntry = new LeaderboardEntry
                    {
                        Id = Guid.NewGuid(),
                        UserId = userGuid,
                        Score = score,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    var response = await _supabaseClient
                        .From<LeaderboardEntry>()
                        .Insert(newEntry);

                    updatedEntry = response.Models.First();
                    _logger.LogInformation("Created new leaderboard entry {Id} for user {UserId}", 
                        updatedEntry.Id, userId);
                }

                // Invalidate the cache for the current week
                await InvalidateLeaderboardCacheAsync(currentWeek);

                return _mapper.Map<LeaderboardEntryResponse>(updatedEntry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating leaderboard entry for user {UserId}", userId);
                throw;
            }
        }

        private async Task InvalidateLeaderboardCacheAsync(string weekId)
        {
            var tasks = new List<Task>
            {
                // Invalidate specific week cache
                _cache.RemoveAsync($"{CacheKeyPrefix}week:{weekId}")
            };

            await Task.WhenAll(tasks);
        }
    }
}
