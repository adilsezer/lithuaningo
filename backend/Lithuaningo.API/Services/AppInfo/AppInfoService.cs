using AutoMapper;
using Lithuaningo.API.DTOs.AppInfo;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Supabase;
using Supabase;

namespace Lithuaningo.API.Services.AppInfo
{
    public class AppInfoService : IAppInfoService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly ICacheSettingsService _cacheSettingsService;
        private const string CacheKeyPrefix = "app-info:";
        private readonly ILogger<AppInfoService> _logger;
        private readonly IMapper _mapper;
        private readonly CacheInvalidator _cacheInvalidator;

        public AppInfoService(
            ISupabaseService supabaseService,
            ICacheService cache,
            ICacheSettingsService cacheSettingsService,
            ILogger<AppInfoService> logger,
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
                    .From<Models.AppInfo>()
                    .Where(a => a.Platform == normalizedPlatform)
                    .Single();

                var appInfo = response;
                if (appInfo == null)
                {
                    // Create a default record if not found
                    appInfo = new Models.AppInfo
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
                    };
                }

                var appInfoResponse = _mapper.Map<AppInfoResponse>(appInfo);
                await CacheAppInfoAsync(cacheKey, appInfoResponse);
                _logger.LogInformation("Retrieved and cached app info for platform '{Platform}'", platform);

                return appInfoResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving app info for platform '{Platform}'", platform);
                throw;
            }
        }

        private async Task CacheAppInfoAsync(string cacheKey, AppInfoResponse response)
        {
            var settings = await _cacheSettingsService.GetCacheSettingsAsync();
            await _cache.SetAsync(cacheKey, response,
                TimeSpan.FromMinutes(settings.AppInfoCacheMinutes));
        }
    }
}
