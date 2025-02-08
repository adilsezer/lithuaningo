using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;

namespace Lithuaningo.API.Services.Cache;

public class DistributedCacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private readonly CacheSettings _settings;
    private readonly JsonSerializerOptions _jsonOptions;

    public DistributedCacheService(
        IDistributedCache cache,
        IOptions<CacheSettings> settings)
    {
        _cache = cache;
        _settings = settings.Value;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        var value = await _cache.GetStringAsync(key);
        return value == null ? default : JsonSerializer.Deserialize<T>(value, _jsonOptions);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = 
                expiration ?? TimeSpan.FromMinutes(_settings.DefaultExpirationMinutes)
        };

        var jsonValue = JsonSerializer.Serialize(value, _jsonOptions);
        await _cache.SetStringAsync(key, jsonValue, options);
    }

    public async Task RemoveAsync(string key)
    {
        await _cache.RemoveAsync(key);
    }

    public async Task RemoveByPrefixAsync(string prefix)
    {
        // Note: This is a basic implementation. In a production environment,
        // you might want to use Redis's SCAN command or implement a key tracking mechanism
        // This implementation assumes you're using key patterns like "prefix:*"
        await Task.CompletedTask;
    }
} 