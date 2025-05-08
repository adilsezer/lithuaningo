using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;

namespace Lithuaningo.API.Services.Cache;

public class InMemoryCacheService : ICacheService
{
    private readonly IMemoryCache _cache;
    private readonly ICacheSettingsService _cacheSettingsService;
    private readonly ILogger<InMemoryCacheService> _logger;
    private readonly ConcurrentDictionary<string, bool> _cacheKeys = new();
    private CacheSettings? _cacheSettings;
    private DateTime _cacheSettingsLastRefreshed = DateTime.MinValue;
    private readonly TimeSpan _cacheSettingsRefreshInterval = TimeSpan.FromMinutes(5);

    public InMemoryCacheService(
        IMemoryCache cache,
        ICacheSettingsService cacheSettingsService,
        ILogger<InMemoryCacheService> logger)
    {
        _cache = cache;
        _cacheSettingsService = cacheSettingsService;
        _logger = logger;
    }

    private async Task<CacheSettings> GetCacheSettingsAsync()
    {
        var now = DateTime.UtcNow;

        // Refresh settings periodically
        if (_cacheSettings == null || (now - _cacheSettingsLastRefreshed) > _cacheSettingsRefreshInterval)
        {
            try
            {
                _cacheSettings = await _cacheSettingsService.GetCacheSettingsAsync();
                _cacheSettingsLastRefreshed = now;
                _logger.LogInformation("Cache settings loaded from database");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load cache settings from database, using defaults");
                // Use default values if the database call fails
                _cacheSettings = new CacheSettings
                {
                    DefaultExpirationMinutes = 10,
                    FlashcardCacheMinutes = 5,
                    LeaderboardCacheMinutes = 2,
                    AppInfoCacheMinutes = 5
                };
            }
        }
        return _cacheSettings;
    }

    public Task<T?> GetAsync<T>(string key)
    {
        return Task.FromResult(_cache.Get<T>(key));
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        var settings = await GetCacheSettingsAsync();

        var options = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow =
                expiration ?? TimeSpan.FromMinutes(settings.DefaultExpirationMinutes)
        };

        options.RegisterPostEvictionCallback((evictedKey, _, _, _) =>
        {
            _cacheKeys.TryRemove(evictedKey.ToString()!, out _);
        });

        _cacheKeys[key] = true;
        _cache.Set(key, value, options);
    }

    public Task RemoveAsync(string key)
    {
        _cache.Remove(key);
        _cacheKeys.TryRemove(key, out _);
        return Task.CompletedTask;
    }

    public Task RemoveByPrefixAsync(string prefix)
    {
        var keysToRemove = _cacheKeys.Keys
            .Where(k => k.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            .ToList();

        foreach (var key in keysToRemove)
        {
            _cache.Remove(key);
            _cacheKeys.TryRemove(key, out _);
        }

        return Task.CompletedTask;
    }

    public Task ClearAllAsync()
    {
        foreach (var key in _cacheKeys.Keys.ToList())
        {
            _cache.Remove(key);
        }
        _cacheKeys.Clear();
        return Task.CompletedTask;
    }
}