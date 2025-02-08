using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Threading.Tasks;
using Lithuaningo.API.Utilities;
using static Supabase.Postgrest.Constants;
using Supabase;

namespace Lithuaningo.API.Services
{
    public class SupabaseLeaderboardService : ILeaderboardService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "leaderboard:";
        private readonly ILogger<SupabaseLeaderboardService> _logger;

        public SupabaseLeaderboardService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<SupabaseLeaderboardService> logger)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<LeaderboardWeek> GetCurrentWeekLeaderboardAsync()
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

        public async Task<LeaderboardWeek> GetWeekLeaderboardAsync(string weekId)
        {
            if (string.IsNullOrWhiteSpace(weekId))
            {
                throw new ArgumentException("Week ID cannot be empty", nameof(weekId));
            }

            var cacheKey = $"{CacheKeyPrefix}week:{weekId}";
            var cached = await _cache.GetAsync<LeaderboardWeek>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved leaderboard from cache for week {WeekId}", weekId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<LeaderboardEntry>()
                    .Filter(l => l.Period, Operator.Equals, weekId)
                    .Order(l => l.Score, Ordering.Descending)
                    .Get();

                var (startDate, endDate) = DateUtils.GetWeekDates(weekId);
                var entries = response.Models.ToDictionary(
                    l => l.UserId.ToString(),
                    l => new LeaderboardEntry
                    {
                        Id = l.Id,
                        UserId = l.UserId,
                        Name = string.Empty, // This can be populated later from user profile data.
                        Period = l.Period,
                        Score = l.Score,
                        Rank = l.Rank,
                        CreatedAt = l.CreatedAt,
                        UpdatedAt = l.UpdatedAt
                    }
                );

                var leaderboard = new LeaderboardWeek
                {
                    Id = weekId,
                    StartDate = startDate,
                    EndDate = endDate,
                    Entries = entries
                };

                await _cache.SetAsync(cacheKey, leaderboard,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached leaderboard for week {WeekId} with {Count} entries", 
                    weekId, entries.Count);

                return leaderboard;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving leaderboard for week {WeekId}", weekId);
                throw;
            }
        }

        public async Task UpdateLeaderboardEntryAsync(string userId, string name, int score)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Name cannot be empty", nameof(name));
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
                    .Filter(l => l.Period, Operator.Equals, currentWeek)
                    .Filter(l => l.UserId, Operator.Equals, userGuid)
                    .Get();

                var existing = existingResponse.Models.FirstOrDefault();

                if (existing != null)
                {
                    // Update the existing entry.
                    existing.Score = score;
                    existing.Name = name;
                    existing.UpdatedAt = DateTime.UtcNow;

                    var response = await _supabaseClient
                        .From<LeaderboardEntry>()
                        .Where(l => l.Id == existing.Id)
                        .Update(existing);

                    var updatedEntry = response.Models.First();
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
                        Name = name,
                        Period = currentWeek,
                        Score = score,
                        Rank = 0, // Will be updated by a Supabase function later.
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    var response = await _supabaseClient
                        .From<LeaderboardEntry>()
                        .Insert(newEntry);

                    var createdEntry = response.Models.First();
                    _logger.LogInformation("Created new leaderboard entry {Id} for user {UserId}", 
                        createdEntry.Id, userId);
                }

                // Invalidate the cache for the current week
                await InvalidateLeaderboardCacheAsync(currentWeek);
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
