using System;
using System.Linq;
using System.Threading.Tasks;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using static Supabase.Postgrest.Constants;
using Supabase;

namespace Lithuaningo.API.Services
{
    public class SupabaseAppInfoService : IAppInfoService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "app-info:";
        private readonly ILogger<SupabaseAppInfoService> _logger;

        public SupabaseAppInfoService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<SupabaseAppInfoService> logger)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<AppInfo> GetAppInfoAsync(string platform)
        {
            if (string.IsNullOrWhiteSpace(platform))
            {
                throw new ArgumentException("Platform cannot be empty", nameof(platform));
            }

            var normalizedPlatform = platform.ToLowerInvariant();
            var cacheKey = $"{CacheKeyPrefix}{normalizedPlatform}";
            var cached = await _cache.GetAsync<AppInfo>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved app info for platform '{Platform}' from cache", platform);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<AppInfo>()
                    .Filter(a => a.Platform, Operator.Equals, normalizedPlatform)
                    .Get();

                var appInfo = response.Models.FirstOrDefault();
                if (appInfo == null)
                {
                    // Create a default record if not found
                    appInfo = new AppInfo
                    {
                        Id = Guid.NewGuid(),
                        Platform = normalizedPlatform,
                        LatestVersion = "1.0.0",
                        MinimumVersion = "1.0.0",
                        IsMaintenance = false,
                        MaintenanceMessage = null,
                        ForceUpdate = false,
                        UpdateUrl = null,
                        ReleaseNotes = null,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                }

                await _cache.SetAsync(cacheKey, appInfo,
                    TimeSpan.FromMinutes(_cacheSettings.AppInfoCacheMinutes));
                _logger.LogInformation("Retrieved and cached app info for platform '{Platform}'", platform);

                return appInfo;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving app info for platform '{Platform}'", platform);
                throw;
            }
        }

        public async Task<AppInfo> UpdateAppInfoAsync(string platform, AppInfo appInfo)
        {
            if (string.IsNullOrWhiteSpace(platform))
            {
                throw new ArgumentException("Platform cannot be empty", nameof(platform));
            }

            if (appInfo == null)
            {
                throw new ArgumentNullException(nameof(appInfo));
            }

            var normalizedPlatform = platform.ToLowerInvariant();
            var cacheKey = $"{CacheKeyPrefix}{normalizedPlatform}";

            try
            {
                // Normalize platform and update timestamp
                appInfo.Platform = normalizedPlatform;
                appInfo.UpdatedAt = DateTime.UtcNow;

                // Attempt to fetch an existing record
                var response = await _supabaseClient
                    .From<AppInfo>()
                    .Filter(a => a.Platform, Operator.Equals, normalizedPlatform)
                    .Get();

                var existingAppInfo = response.Models.FirstOrDefault();
                if (existingAppInfo != null)
                {
                    // Preserve original Id and CreatedAt timestamp
                    appInfo.Id = existingAppInfo.Id;
                    appInfo.CreatedAt = existingAppInfo.CreatedAt;
                }
                else
                {
                    appInfo.Id = Guid.NewGuid();
                    appInfo.CreatedAt = DateTime.UtcNow;
                }

                // Perform upsert operation
                var upsertResponse = await _supabaseClient
                    .From<AppInfo>()
                    .Upsert(appInfo);

                var upsertedAppInfo = upsertResponse.Models.FirstOrDefault() ?? appInfo;

                // Update cache with new data
                await _cache.SetAsync(cacheKey, upsertedAppInfo,
                    TimeSpan.FromMinutes(_cacheSettings.AppInfoCacheMinutes));
                _logger.LogInformation("Updated and cached app info for platform '{Platform}'", platform);

                return upsertedAppInfo;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating app info for platform '{Platform}'", platform);
                throw;
            }
        }

        public async Task DeleteAppInfoAsync(string id)
        {
            if (!Guid.TryParse(id, out var appInfoId))
            {
                throw new ArgumentException("Invalid app info ID format", nameof(id));
            }

            try
            {
                // Get the app info first to know which cache key to invalidate
                var response = await _supabaseClient
                    .From<AppInfo>()
                    .Where(a => a.Id == appInfoId)
                    .Get();

                var appInfo = response.Models.FirstOrDefault();
                if (appInfo != null)
                {
                    // Remove from cache
                    var cacheKey = $"{CacheKeyPrefix}{appInfo.Platform}";
                    await _cache.RemoveAsync(cacheKey);
                }

                // Delete from database
                await _supabaseClient
                    .From<AppInfo>()
                    .Where(a => a.Id == appInfoId)
                    .Delete();

                _logger.LogInformation("Deleted app info with ID '{Id}'", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting app info with ID '{Id}'", id);
                throw;
            }
        }
    }
}
