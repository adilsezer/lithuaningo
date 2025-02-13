using System;
using System.Linq;
using System.Threading.Tasks;
using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.AppInfo;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using static Supabase.Postgrest.Constants;
using Supabase;
using AutoMapper;

namespace Lithuaningo.API.Services
{
    public class AppInfoService : IAppInfoService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "app-info:";
        private readonly ILogger<AppInfoService> _logger;
        private readonly IMapper _mapper;

        public AppInfoService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<AppInfoService> logger,
            IMapper mapper)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<AppInfoResponse?> GetAppInfoAsync(string platform)
        {
            if (string.IsNullOrWhiteSpace(platform))
            {
                throw new ArgumentException("Platform cannot be empty", nameof(platform));
            }

            var normalizedPlatform = platform.ToLowerInvariant();
            var cacheKey = $"{CacheKeyPrefix}{normalizedPlatform}";
            var cached = await _cache.GetAsync<AppInfoResponse>(cacheKey);

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
                        CurrentVersion = "1.0.0",
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

                var appInfoResponse = _mapper.Map<AppInfoResponse>(appInfo);
                await _cache.SetAsync(cacheKey, appInfoResponse,
                    TimeSpan.FromMinutes(_cacheSettings.AppInfoCacheMinutes));
                _logger.LogInformation("Retrieved and cached app info for platform '{Platform}'", platform);

                return appInfoResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving app info for platform '{Platform}'", platform);
                throw;
            }
        }

        public async Task<AppInfoResponse> UpdateAppInfoAsync(string platform, UpdateAppInfoRequest request)
        {
            if (string.IsNullOrWhiteSpace(platform))
            {
                throw new ArgumentException("Platform cannot be empty", nameof(platform));
            }

            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            var normalizedPlatform = platform.ToLowerInvariant();
            var cacheKey = $"{CacheKeyPrefix}{normalizedPlatform}";

            try
            {
                // Attempt to fetch an existing record
                var response = await _supabaseClient
                    .From<AppInfo>()
                    .Filter(a => a.Platform, Operator.Equals, normalizedPlatform)
                    .Get();

                var existingAppInfo = response.Models.FirstOrDefault();
                var appInfo = new AppInfo
                {
                    Id = existingAppInfo?.Id ?? Guid.NewGuid(),
                    Platform = normalizedPlatform,
                    CurrentVersion = request.CurrentVersion,
                    MinimumVersion = request.MinimumVersion,
                    ForceUpdate = request.ForceUpdate,
                    UpdateUrl = request.UpdateUrl,
                    IsMaintenance = request.IsMaintenance,
                    MaintenanceMessage = request.MaintenanceMessage,
                    ReleaseNotes = request.ReleaseNotes,
                    CreatedAt = existingAppInfo?.CreatedAt ?? DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Perform upsert operation
                var upsertResponse = await _supabaseClient
                    .From<AppInfo>()
                    .Upsert(appInfo);

                var upsertedAppInfo = upsertResponse.Models.First();
                var appInfoResponse = _mapper.Map<AppInfoResponse>(upsertedAppInfo);

                // Update cache with new data
                await _cache.SetAsync(cacheKey, appInfoResponse,
                    TimeSpan.FromMinutes(_cacheSettings.AppInfoCacheMinutes));
                _logger.LogInformation("Updated and cached app info for platform '{Platform}'", platform);

                return appInfoResponse;
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
