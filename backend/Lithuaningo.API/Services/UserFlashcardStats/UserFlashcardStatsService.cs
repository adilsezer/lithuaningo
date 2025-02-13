using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.UserFlashcardStats;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using static Supabase.Postgrest.Constants;
using Supabase;
using AutoMapper;

namespace Lithuaningo.API.Services
{
    public class UserFlashcardStatsService : IUserFlashcardStatsService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "flashcard-stats:";
        private readonly ILogger<UserFlashcardStatsService> _logger;
        private readonly IMapper _mapper;

        public UserFlashcardStatsService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<UserFlashcardStatsService> logger,
            IMapper mapper)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<UserFlashcardStatsResponse> GetUserFlashcardStatsAsync(string deckId, string userId)
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
            var cached = await _cache.GetAsync<UserFlashcardStatsResponse>(cacheKey);

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

                var result = await _supabaseClient.Rpc<UserFlashcardStats>("get_flashcard_stats", parameters);
                
                if (result == null)
                {
                    _logger.LogInformation("No flashcard stats found for deck {DeckId} and user {UserId}", 
                        deckId, userId);
                    result = new UserFlashcardStats
                    {
                        Id = Guid.NewGuid(),
                        UserId = userGuid,
                        FlashcardId = Guid.Empty,
                        LastReviewedAt = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                }

                var response = _mapper.Map<UserFlashcardStatsResponse>(result);
                await _cache.SetAsync(cacheKey, response,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached flashcard stats for deck {DeckId} and user {UserId}", 
                    deckId, userId);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching flashcard stats for deck {DeckId} and user {UserId}", 
                    deckId, userId);
                throw;
            }
        }

        public async Task TrackUserFlashcardStatsAsync(string deckId, string userId, TrackProgressRequest request)
        {
            if (!Guid.TryParse(deckId, out _))
            {
                throw new ArgumentException("Invalid deck ID format", nameof(deckId));
            }

            if (!Guid.TryParse(userId, out _))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            if (!Guid.TryParse(request.FlashcardId, out _))
            {
                throw new ArgumentException("Invalid flashcard ID format", nameof(request.FlashcardId));
            }

            try
            {
                var parameters = new Dictionary<string, object>
                {
                    { "deck_id", deckId },
                    { "user_id", userId },
                    { "flashcard_id", request.FlashcardId },
                    { "was_correct", request.IsCorrect },
                    { "review_time", DateTime.UtcNow }
                };

                if (request.ConfidenceLevel.HasValue)
                {
                    parameters.Add("confidence_level", request.ConfidenceLevel.Value);
                }

                if (request.TimeTakenSeconds > 0)
                {
                    parameters.Add("time_taken_seconds", request.TimeTakenSeconds);
                }

                await _supabaseClient.Rpc("track_flashcard_stats", parameters);

                // Invalidate relevant cache entries
                await InvalidateUserFlashcardStatsCacheAsync(deckId, userId);
                _logger.LogInformation("Tracked flashcard stats for deck {DeckId}, user {UserId}, flashcard {FlashcardId}", 
                    deckId, userId, request.FlashcardId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error tracking flashcard stats for deck {DeckId}, user {UserId}, flashcard {FlashcardId}", 
                    deckId, userId, request.FlashcardId);
                throw;
            }
        }

        public async Task<List<UserFlashcardStatsResponse>> GetUserFlashcardHistoryAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            var cacheKey = $"{CacheKeyPrefix}history:{userGuid}";
            var cached = await _cache.GetAsync<List<UserFlashcardStatsResponse>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved flashcard history from cache for user {UserId}", userId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<UserFlashcardStats>()
                    .Filter("user_id", Operator.Equals, userGuid)
                    .Order("last_reviewed_at", Ordering.Descending)
                    .Get();

                var stats = response.Models;
                var statsResponse = _mapper.Map<List<UserFlashcardStatsResponse>>(stats);

                await _cache.SetAsync(cacheKey, statsResponse,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} flashcard history entries for user {UserId}", 
                    stats.Count, userId);

                return statsResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching flashcard history for user {UserId}", userId);
                throw;
            }
        }

        private async Task InvalidateUserFlashcardStatsCacheAsync(string deckId, string userId)
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
