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
        private const int LEADERBOARD_SIZE = 20;

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

        public async Task<List<LeaderboardEntryResponse>> GetCurrentWeekLeaderboardAsync()
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
                // Get top 20 leaderboard entries
                var entriesResponse = await _supabaseClient
                    .From<LeaderboardEntry>()
                    .Select("*")
                    .Where(l => l.WeekId == weekId)
                    .Order("score", Ordering.Descending)
                    .Limit(LEADERBOARD_SIZE)
                    .Get();

                var entries = entriesResponse.Models;

                // Fetch user profiles separately
                var userIds = entries.Select(e => e.UserId).ToList();
                var userProfiles = await _supabaseClient
                    .From<UserProfile>()
                    .Filter("id", Operator.In, userIds)
                    .Get();

                var userProfileMap = userProfiles.Models.ToDictionary(u => u.Id);

                // Map entries to response DTOs with user information
                var mappedEntries = entries.Select(entry =>
                {
                    var dto = _mapper.Map<LeaderboardEntryResponse>(entry);
                    dto.Username = userProfileMap.TryGetValue(entry.UserId, out var profile) 
                        ? profile.FullName ?? "Unknown User" 
                        : "Unknown User";
                    return dto;
                }).ToList();

                await _cache.SetAsync(cacheKey, mappedEntries,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));

                _logger.LogInformation("Retrieved and cached leaderboard for week {WeekId} with {Count} entries", 
                    weekId, entries.Count);

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
                    .From<UserProfile>()
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
                        .Set(l => l.UpdatedAt, DateTime.UtcNow)
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
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
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
            var cacheKey = $"{CacheKeyPrefix}week:{weekId}";
            await _cache.RemoveAsync(cacheKey);
        }
    }
}
