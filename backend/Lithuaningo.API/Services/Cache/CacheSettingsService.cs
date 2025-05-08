using System;
using System.Threading.Tasks;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Supabase;
using Microsoft.Extensions.Caching.Memory;
using Supabase;
using static Supabase.Postgrest.Constants;

namespace Lithuaningo.API.Services.Cache
{
    public class CacheSettingsService : ICacheSettingsService
    {
        private readonly Client _supabaseClient;
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<CacheSettingsService> _logger;
        private const string CacheKeyPrefix = "cache-settings:";
        private const string DefaultCacheSetting = "default";
        private const string FlashcardCacheSetting = "flashcard";
        private const string LeaderboardCacheSetting = "leaderboard";
        private const string AppInfoCacheSetting = "app_info";
        private readonly TimeSpan _cacheExpiration = TimeSpan.FromMinutes(60);

        public CacheSettingsService(
            ISupabaseService supabaseService,
            IMemoryCache memoryCache,
            ILogger<CacheSettingsService> logger)
        {
            _supabaseClient = supabaseService.Client;
            _memoryCache = memoryCache;
            _logger = logger;
        }

        public async Task<CacheSettings> GetCacheSettingsAsync()
        {
            try
            {
                // Try to get from memory cache first
                var cacheKey = $"{CacheKeyPrefix}all";
                if (_memoryCache.TryGetValue(cacheKey, out CacheSettings? cachedSettings))
                {
                    _logger.LogDebug("Retrieved cache settings from memory cache");
                    return cachedSettings!;
                }

                // Create settings object to populate
                var settings = new CacheSettings();

                // Get default setting
                var defaultSetting = await GetSettingValueAsync(DefaultCacheSetting, 10);
                settings.DefaultExpirationMinutes = defaultSetting;

                // Get specific settings with fallback to default
                settings.FlashcardCacheMinutes = await GetSettingValueAsync(FlashcardCacheSetting, defaultSetting);
                settings.LeaderboardCacheMinutes = await GetSettingValueAsync(LeaderboardCacheSetting, defaultSetting);
                settings.AppInfoCacheMinutes = await GetSettingValueAsync(AppInfoCacheSetting, defaultSetting);

                // Cache the result in memory cache
                _memoryCache.Set(cacheKey, settings, _cacheExpiration);

                return settings;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving cache settings, using defaults");
                return GetDefaultSettings();
            }
        }

        private async Task<int> GetSettingValueAsync(string key, int defaultValue)
        {
            try
            {
                var query = _supabaseClient
                    .From<CacheSettingEntity>()
                    .Filter("key", Operator.Equals, key)
                    .Select("value_minutes");

                var result = await query.Get();
                var setting = result.Models?.FirstOrDefault();

                if (setting == null)
                {
                    _logger.LogWarning("Cache setting '{Key}' not found, using default value", key);
                    return defaultValue;
                }

                return setting.ValueMinutes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving cache setting '{Key}', using default value", key);
                return defaultValue;
            }
        }

        private CacheSettings GetDefaultSettings()
        {
            return new CacheSettings
            {
                DefaultExpirationMinutes = 10,
                FlashcardCacheMinutes = 5,
                LeaderboardCacheMinutes = 2,
                AppInfoCacheMinutes = 5
            };
        }
    }
}