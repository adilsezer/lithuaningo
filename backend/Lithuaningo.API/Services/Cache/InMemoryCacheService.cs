using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace Lithuaningo.API.Services.Cache;

public class InMemoryCacheService : ICacheService
{
    private readonly IMemoryCache _cache;
    private readonly CacheSettings _settings;

    public InMemoryCacheService(
        IMemoryCache cache,
        IOptions<CacheSettings> settings)
    {
        _cache = cache;
        _settings = settings.Value;
    }

    public Task<T?> GetAsync<T>(string key)
    {
        return Task.FromResult(_cache.Get<T>(key));
    }

    public Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        var options = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = 
                expiration ?? TimeSpan.FromMinutes(_settings.DefaultExpirationMinutes)
        };

        _cache.Set(key, value, options);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key)
    {
        _cache.Remove(key);
        return Task.CompletedTask;
    }

    public Task RemoveByPrefixAsync(string prefix)
    {
        // Note: This is a basic implementation for in-memory cache
        // In a production environment, you might want to implement a more sophisticated
        // key tracking mechanism
        return Task.CompletedTask;
    }
} 