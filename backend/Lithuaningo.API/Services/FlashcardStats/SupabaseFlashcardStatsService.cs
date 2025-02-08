using System;
using System.Collections.Generic;
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
    public class SupabaseFlashcardStatsService : IFlashcardStatsService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "flashcard-stats:";
        private readonly ILogger<SupabaseFlashcardStatsService> _logger;

        public SupabaseFlashcardStatsService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<SupabaseFlashcardStatsService> logger)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<FlashcardStats> GetFlashcardStatsAsync(string deckId, string userId)
        {
            if (!Guid.TryParse(deckId, out var deckGuid))
            {
                throw new ArgumentException("Invalid deck ID format", nameof(deckId));
            }

            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            var cacheKey = $"{CacheKeyPrefix}{deckGuid}:{userGuid}";
            var cached = await _cache.GetAsync<FlashcardStats>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved flashcard stats from cache for deck {DeckId} and user {UserId}", 
                    deckId, userId);
                return cached;
            }

            try
            {
                var parameters = new Dictionary<string, object>
                {
                    { "deck_id", deckId },
                    { "user_id", userId }
                };

                var result = await _supabaseClient.Rpc<FlashcardStats>("get_flashcard_stats", parameters);
                
                if (result == null)
                {
                    _logger.LogInformation("No flashcard stats found for deck {DeckId} and user {UserId}", 
                        deckId, userId);
                    result = new FlashcardStats
                    {
                        Id = Guid.NewGuid(),
                        UserId = userGuid,
                        FlashcardId = Guid.Empty,
                        ConfidenceLevel = 0,
                        LastReviewedAt = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        NextReviewAt = null
                    };
                }

                await _cache.SetAsync(cacheKey, result,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached flashcard stats for deck {DeckId} and user {UserId}", 
                    deckId, userId);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching flashcard stats for deck {DeckId} and user {UserId}", 
                    deckId, userId);
                throw;
            }
        }

        public async Task TrackFlashcardStatsAsync(string deckId, string userId, string flashcardId, bool isCorrect)
        {
            if (!Guid.TryParse(deckId, out _))
            {
                throw new ArgumentException("Invalid deck ID format", nameof(deckId));
            }

            if (!Guid.TryParse(userId, out _))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            if (!Guid.TryParse(flashcardId, out _))
            {
                throw new ArgumentException("Invalid flashcard ID format", nameof(flashcardId));
            }

            try
            {
                var parameters = new Dictionary<string, object>
                {
                    { "deck_id", deckId },
                    { "user_id", userId },
                    { "flashcard_id", flashcardId },
                    { "was_correct", isCorrect },
                    { "review_time", DateTime.UtcNow }
                };

                await _supabaseClient.Rpc("track_flashcard_stats", parameters);

                // Invalidate relevant cache entries
                await InvalidateFlashcardStatsCacheAsync(deckId, userId);
                _logger.LogInformation("Tracked flashcard stats for deck {DeckId}, user {UserId}, flashcard {FlashcardId}", 
                    deckId, userId, flashcardId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error tracking flashcard stats for deck {DeckId}, user {UserId}, flashcard {FlashcardId}", 
                    deckId, userId, flashcardId);
                throw;
            }
        }

        public async Task<List<FlashcardStats>> GetUserFlashcardHistoryAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            var cacheKey = $"{CacheKeyPrefix}history:{userGuid}";
            var cached = await _cache.GetAsync<List<FlashcardStats>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved flashcard history from cache for user {UserId}", userId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<FlashcardStats>()
                    .Filter("user_id", Operator.Equals, userGuid)
                    .Order("last_reviewed_at", Ordering.Descending)
                    .Get();

                var stats = response.Models;

                await _cache.SetAsync(cacheKey, stats,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} flashcard history entries for user {UserId}", 
                    stats.Count, userId);

                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching flashcard history for user {UserId}", userId);
                throw;
            }
        }

        private async Task InvalidateFlashcardStatsCacheAsync(string deckId, string userId)
        {
            var tasks = new List<Task>
            {
                // Invalidate specific deck-user stats cache
                _cache.RemoveAsync($"{CacheKeyPrefix}{deckId}:{userId}"),
                
                // Invalidate user's history cache
                _cache.RemoveAsync($"{CacheKeyPrefix}history:{userId}")
            };

            await Task.WhenAll(tasks);
        }
    }
}
