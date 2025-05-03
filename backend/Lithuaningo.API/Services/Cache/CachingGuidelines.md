# Lithuaningo API Caching Guidelines

This document outlines the caching strategy used in the Lithuaningo API project and provides guidelines for using the caching system effectively.

## Overview

Our caching system uses a simple but effective in-memory approach with the following components:

1. **ICacheService** - The interface that defines caching operations
2. **InMemoryCacheService** - Implementation using Microsoft's MemoryCache
3. **CacheInvalidator** - Helper class for centralizing cache invalidation patterns
4. **CacheSettings** - Configuration class for expiration times

## Cache Keys

Each entity type has a specific prefix for its cache keys:

- Flashcards: `flashcard:`
- User Profiles: `user:`
- App Info: `appinfo:`

## Using the Cache

### Reading from Cache

When retrieving data, always check the cache first:

```csharp
// Example of the cache-aside pattern
var cacheKey = $"{CacheKeyPrefix}{id}";
var cached = await _cache.GetAsync<EntityType>(cacheKey);

if (cached != null)
{
    _logger.LogInformation("Retrieved from cache");
    return cached;
}

// Fetch from database if not in cache
var result = await FetchFromDatabaseAsync(id);

// Store in cache for future use
await _cache.SetAsync(cacheKey, result,
    TimeSpan.FromMinutes(_cacheSettings.EntityCacheMinutes));

return result;
```

### Invalidating Cache

Always use the `CacheInvalidator` to invalidate cache entries when data changes:

## Cache Durations

Cache durations are configured in `CacheSettings`:

- Default: 10 minutes
- Flashcards: 5 minutes
- Leaderboard: 2 minutes (frequent updates)
- App Info: 60 minutes

## Best Practices

1. **Use proper prefixes**: Always use the established key prefixes for consistency
2. **Set appropriate expirations**: Use the configured expiration times from `CacheSettings`
3. **Invalidate correctly**: Use `CacheInvalidator` to ensure all related cache entries are cleared
4. **Log cache operations**: Include logging for cache hits and misses for monitoring
5. **Don't over-cache**: Only cache data that is:
   - Frequently accessed
   - Expensive to compute/retrieve
   - Relatively stable

## When to Invalidate Cache

- When creating new entities
- When updating existing entities
- When deleting entities
- When relationships between entities change

## Implementing Cache for New Features

1. Add appropriate settings to `CacheSettings`
2. Add invalidation methods to `CacheInvalidator` if needed
3. Follow the cache-aside pattern in your service methods
4. Ensure proper invalidation on all write operations

## Debugging Cache Issues

If you suspect caching issues:

1. Check logs for cache hits/misses
2. Review invalidation patterns in the affected service
3. Verify that cache keys follow the established patterns
4. Test with cache disabled to compare behavior

For more complex caching needs or performance improvements, consider implementing distributed caching with Redis in the future.
