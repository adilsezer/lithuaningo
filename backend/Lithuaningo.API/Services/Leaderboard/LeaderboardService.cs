using AutoMapper;
using Lithuaningo.API.DTOs.Leaderboard;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Supabase;
using Lithuaningo.API.Utilities;
using Supabase;
using static Supabase.Postgrest.Constants;
namespace Lithuaningo.API.Services.Leaderboard
{
    public class LeaderboardService : ILeaderboardService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly ICacheSettingsService _cacheSettingsService;
        private const string CacheKeyPrefix = "leaderboard:";
        private readonly ILogger<LeaderboardService> _logger;
        private readonly IMapper _mapper;
        private const int LEADERBOARD_SIZE = 20;
        private readonly CacheInvalidator _cacheInvalidator;

        public LeaderboardService(
            ISupabaseService supabaseService,
            ICacheService cache,
            ICacheSettingsService cacheSettingsService,
            ILogger<LeaderboardService> logger,
            IMapper mapper,
            CacheInvalidator cacheInvalidator)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettingsService = cacheSettingsService;
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
                    _logger.LogInformation("Retrieved current week leaderboard from cache");
                    return cached;
                }

                // Get the actual data
                var leaderboard = await GetWeekLeaderboardAsync(currentWeek);

                // Cache under the current week key as well
                var settings = await _cacheSettingsService.GetCacheSettingsAsync();
                await _cache.SetAsync(cacheKey, leaderboard,
                    TimeSpan.FromMinutes(settings.LeaderboardCacheMinutes));

                _logger.LogInformation("Cached current week leaderboard");

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
                _logger.LogInformation("Retrieved leaderboard from cache");
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

                // Add rank to each entry
                for (int i = 0; i < mappedEntries.Count; i++)
                {
                    mappedEntries[i].Rank = i + 1;
                }

                var settings = await _cacheSettingsService.GetCacheSettingsAsync();
                await _cache.SetAsync(cacheKey, mappedEntries,
                    TimeSpan.FromMinutes(settings.LeaderboardCacheMinutes));

                _logger.LogInformation("Retrieved and cached leaderboard entries");

                return mappedEntries;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving leaderboard");
                throw;
            }
        }

        public async Task<LeaderboardEntryResponse> UpdateLeaderboardEntryAsync(UpdateLeaderboardEntryRequest request)
        {
            ArgumentNullException.ThrowIfNull(request);

            if (request.ScoreToAdd < 0)
            {
                throw new ArgumentException("Score must be non-negative", nameof(request));
            }

            var currentWeek = DateUtils.GetCurrentWeekPeriod();

            try
            {
                // Try to find an existing entry for this user in the current week
                var existingResponse = await _supabaseClient
                    .From<LeaderboardEntry>()
                    .Where(l => l.UserId == request.UserId)
                    .Where(l => l.WeekId == currentWeek)
                    .Single();

                LeaderboardEntry updatedEntry;
                if (existingResponse != null)
                {
                    // Update existing entry by adding the new score to the existing score
                    var response = await _supabaseClient
                        .From<LeaderboardEntry>()
                        .Where(l => l.Id == existingResponse.Id)
                        .Set(l => l.Score, existingResponse.Score + request.ScoreToAdd)
                        .Update();

                    updatedEntry = response.Models.First();
                    _logger.LogInformation("Updated leaderboard entry");
                }
                else
                {
                    // Create new entry starting with the initial score
                    var newEntry = new LeaderboardEntry
                    {
                        Id = Guid.NewGuid(),
                        UserId = request.UserId,
                        WeekId = currentWeek,
                        Score = request.ScoreToAdd, // Initial score for new entry
                    };

                    var response = await _supabaseClient
                        .From<LeaderboardEntry>()
                        .Insert(newEntry);

                    updatedEntry = response.Models.First();
                    _logger.LogInformation("Created new leaderboard entry");
                }

                // Map to response DTO
                var dto = _mapper.Map<LeaderboardEntryResponse>(updatedEntry);

                // Invalidate cache since leaderboard has changed
                await InvalidateLeaderboardCacheAsync(currentWeek);

                return dto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating leaderboard entry");
                throw;
            }
        }

        private async Task InvalidateLeaderboardCacheAsync(string weekId)
        {
            await _cacheInvalidator.InvalidateLeaderboardCacheAsync(weekId);
        }
    }
}
