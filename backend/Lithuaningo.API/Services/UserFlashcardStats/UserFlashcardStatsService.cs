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
                // First check if the deck exists
                var deckResponse = await _supabaseClient
                    .From<Deck>()
                    .Where(d => d.Id == deckGuid)
                    .Single();

                if (deckResponse == null)
                {
                    _logger.LogWarning("Deck {DeckId} not found", deckId);
                    return new UserFlashcardStatsResponse
                    {
                        Id = Guid.NewGuid(),
                        UserId = userGuid,
                        FlashcardId = Guid.Empty,
                        AccuracyRate = 0,
                        TotalReviewed = 0,
                        CorrectAnswers = 0,
                        LastReviewedAt = DateTime.UtcNow,
                        NextReviewDue = "Later"
                    };
                }

                // Get all flashcards for the deck
                var flashcardsResponse = await _supabaseClient
                    .From<Flashcard>()
                    .Where(f => f.DeckId == deckGuid)
                    .Get();

                if (!flashcardsResponse.Models.Any())
                {
                    _logger.LogInformation("No flashcards found for deck {DeckId}", deckId);
                    return new UserFlashcardStatsResponse
                    {
                        Id = Guid.NewGuid(),
                        UserId = userGuid,
                        FlashcardId = Guid.Empty,
                        AccuracyRate = 0,
                        TotalReviewed = 0,
                        CorrectAnswers = 0,
                        LastReviewedAt = DateTime.UtcNow,
                        NextReviewDue = "Later"
                    };
                }

                var flashcardIds = flashcardsResponse.Models.Select(f => f.Id).ToList();

                // Then get stats for these flashcards
                var statsResponse = await _supabaseClient
                    .From<UserFlashcardStats>()
                    .Where(s => s.UserId == userGuid)
                    .Filter("flashcard_id", Operator.In, flashcardIds)
                    .Get();

                var stats = statsResponse.Models;

                if (!stats.Any())
                {
                    _logger.LogInformation("No flashcard stats found for deck {DeckId} and user {UserId}", 
                        deckId, userId);
                    var response = new UserFlashcardStatsResponse
                    {
                        Id = Guid.NewGuid(),
                        UserId = userGuid,
                        FlashcardId = flashcardIds.FirstOrDefault(),
                        AccuracyRate = 0,
                        TotalReviewed = 0,
                        CorrectAnswers = 0,
                        LastReviewedAt = DateTime.UtcNow,
                        NextReviewDue = "Later"
                    };

                    // Cache the empty stats to prevent repeated queries
                    await _cache.SetAsync(cacheKey, response,
                        TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));

                    return response;
                }

                // Aggregate stats for all flashcards in the deck
                var aggregatedStats = new UserFlashcardStatsResponse
                {
                    Id = Guid.NewGuid(),
                    UserId = userGuid,
                    FlashcardId = flashcardIds.FirstOrDefault(),
                    TotalReviewed = stats.Sum(s => s.TotalReviewed),
                    CorrectAnswers = stats.Sum(s => s.CorrectAnswers),
                    AccuracyRate = stats.Any() ? stats.Average(s => s.AccuracyRate) : 0,
                    LastReviewedAt = stats.Max(s => s.LastReviewedAt),
                    NextReviewDue = stats.Any(s => s.NextReviewDue <= DateTime.UtcNow) ? "Now" : "Later"
                };

                await _cache.SetAsync(cacheKey, aggregatedStats,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached flashcard stats for deck {DeckId} and user {UserId}", 
                    deckId, userId);

                return aggregatedStats;
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
                    .Where(s => s.UserId == userGuid)
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
