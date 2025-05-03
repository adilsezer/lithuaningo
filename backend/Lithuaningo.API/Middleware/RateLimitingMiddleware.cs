using System.Collections.Concurrent;
using System.Net;
using Microsoft.AspNetCore.Http;

namespace Lithuaningo.API.Middleware;

public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ConcurrentDictionary<string, TokenBucket> _buckets = new();
    private const int MaxRequestsPerMinute = 100;

    public RateLimitingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var clientId = GetClientIdentifier(context);
        var bucket = _buckets.GetOrAdd(clientId, _ => new TokenBucket(MaxRequestsPerMinute, TimeSpan.FromMinutes(1)));

        if (!bucket.TryTake())
        {
            context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
            await context.Response.WriteAsJsonAsync(new { message = "Rate limit exceeded. Please try again later." });
            return;
        }

        await _next(context);
    }

    private static string GetClientIdentifier(HttpContext context)
    {
        // Try to get user ID from claims if authenticated
        var userId = context.User?.Identity?.Name;
        if (!string.IsNullOrEmpty(userId))
            return userId;

        // Fall back to IP address
        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    private class TokenBucket
    {
        private readonly int _capacity;
        private readonly TimeSpan _refillTime;
        private readonly object _syncLock = new();
        private double _tokens;
        private DateTime _lastRefill;

        public TokenBucket(int capacity, TimeSpan refillTime)
        {
            _capacity = capacity;
            _refillTime = refillTime;
            _tokens = capacity;
            _lastRefill = DateTime.UtcNow;
        }

        public bool TryTake()
        {
            lock (_syncLock)
            {
                RefillTokens();

                if (_tokens < 1)
                    return false;

                _tokens--;
                return true;
            }
        }

        private void RefillTokens()
        {
            var now = DateTime.UtcNow;
            var timePassed = now - _lastRefill;
            var tokensToAdd = timePassed.TotalSeconds * (_capacity / _refillTime.TotalSeconds);

            _tokens = Math.Min(_capacity, _tokens + tokensToAdd);
            _lastRefill = now;
        }
    }
} 