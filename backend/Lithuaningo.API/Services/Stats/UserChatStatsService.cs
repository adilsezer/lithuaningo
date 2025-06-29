using System.Globalization;
using AutoMapper;
using Lithuaningo.API.DTOs.UserChatStats;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Supabase;
using Lithuaningo.API.Utilities;
using Supabase;

namespace Lithuaningo.API.Services.Stats
{
    /// <summary>
    /// Service for managing user chat statistics
    /// </summary>
    public class UserChatStatsService : IUserChatStatsService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly ICacheSettingsService _cacheSettingsService;
        private const string CacheKeyPrefix = "chat-stats:";
        private readonly ILogger<UserChatStatsService> _logger;
        private readonly IMapper _mapper;
        private readonly CacheInvalidator _cacheInvalidator;

        // Maximum messages per day for free users
        public const int MaxFreeMessagesPerDay = 3;

        // ISO 8601 date format (yyyy-MM-dd) for consistent date comparison
        private const string DateOnlyFormat = "yyyy-MM-dd";

        public UserChatStatsService(
            ISupabaseService supabaseService,
            ICacheService cache,
            ICacheSettingsService cacheSettingsService,
            ILogger<UserChatStatsService> logger,
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

        /// <summary>
        /// Gets chat statistics for the specified user
        /// </summary>
        public async Task<UserChatStatsResponse> GetUserChatStatsAsync(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));
            }

            // Try to get from cache first
            var cacheKey = $"{CacheKeyPrefix}{userId}";
            var cachedStats = await _cache.GetAsync<UserChatStatsResponse>(cacheKey);

            if (cachedStats != null)
            {
                return cachedStats;
            }

            // Get or create stats from database
            var stats = await GetOrCreateChatStatsAsync(userId);

            // Use AutoMapper to map to response
            var response = _mapper.Map<UserChatStatsResponse>(stats);

            // Cache the result
            var settings = await _cacheSettingsService.GetCacheSettingsAsync();
            await _cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(settings.DefaultExpirationMinutes));

            return response;
        }

        /// <summary>
        /// Tracks a message sent by the user
        /// </summary>
        public async Task<UserChatStatsResponse> TrackMessageAsync(string userId, TrackMessageRequest? request = null)
        {
            if (string.IsNullOrEmpty(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));
            }

            // Get or create stats
            var stats = await GetOrCreateChatStatsAsync(userId);

            // Update both counters - Supabase handles daily resets but we still increment both counters
            stats.TodayMessageCount++;
            stats.TotalMessageCount++;
            stats.LastChatDate = DateTime.UtcNow;

            // Save to database
            await _supabaseClient
                .From<UserChatStats>()
                .Update(stats);

            // Invalidate cache using centralized invalidator
            await _cacheInvalidator.InvalidateUserChatStatsAsync(userId);

            // Use AutoMapper to map to response
            var response = _mapper.Map<UserChatStatsResponse>(stats);

            return response;
        }

        /// <summary>
        /// Checks if a user has reached their daily message limit
        /// </summary>
        public async Task<bool> HasReachedDailyLimitAsync(string userId, bool isPremium)
        {
            // Premium users have no limits
            if (isPremium)
            {
                return false;
            }

            var stats = await GetUserChatStatsAsync(userId);
            return stats.TodayMessageCount >= MaxFreeMessagesPerDay;
        }

        /// <summary>
        /// Gets or creates chat stats for a user
        /// </summary>
        private async Task<UserChatStats> GetOrCreateChatStatsAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("User ID must be a valid GUID", nameof(userId));
            }

            var response = await _supabaseClient
                .From<UserChatStats>()
                .Where(u => u.UserId == userGuid)
                .Get();

            var stats = response.Models.FirstOrDefault();
            if (stats != null)
            {
                return stats;
            }

            // Create default stats if none exist
            // Always use UTC for timestamp storage
            DateTime utcNow = DateTime.UtcNow;

            var newStats = new UserChatStats
            {
                Id = Guid.NewGuid(),
                UserId = userGuid,
                LastChatDate = utcNow,
                TodayMessageCount = 0,
                TotalMessageCount = 0
            };

            var createResponse = await _supabaseClient
                .From<UserChatStats>()
                .Insert(newStats);

            if (createResponse.Models.Count == 0)
            {
                throw new InvalidOperationException("Failed to create chat stats");
            }

            return createResponse.Models.First();
        }
    }
}