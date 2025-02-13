using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using static Supabase.Postgrest.Constants;
using Lithuaningo.API.Services.Cache;
using Microsoft.Extensions.Options;
using Supabase;

namespace Lithuaningo.API.Services
{
    public class SupabaseFlashcardService : IFlashcardService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "flashcard:";
        private readonly ILogger<SupabaseFlashcardService> _logger;

        public SupabaseFlashcardService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<SupabaseFlashcardService> logger)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Flashcard?> GetFlashcardByIdAsync(string id)
        {
            if (!Guid.TryParse(id, out var flashcardId))
            {
                throw new ArgumentException("Invalid flashcard ID format", nameof(id));
            }

            var cacheKey = $"{CacheKeyPrefix}{flashcardId}";
            var cached = await _cache.GetAsync<Flashcard>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved flashcard {Id} from cache", id);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<Flashcard>()
                    .Where(f => f.Id == flashcardId)
                    .Get();

                var flashcard = response.Models.FirstOrDefault();
                if (flashcard != null)
                {
                    await _cache.SetAsync(cacheKey, flashcard,
                        TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                    _logger.LogInformation("Retrieved and cached flashcard {Id}", id);
                }
                else
                {
                    _logger.LogInformation("Flashcard {Id} not found", id);
                }

                return flashcard;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving flashcard {Id}", id);
                throw;
            }
        }

        public async Task<List<Flashcard>> GetUserFlashcardsAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            var cacheKey = $"{CacheKeyPrefix}user:{userGuid}";
            var cached = await _cache.GetAsync<List<Flashcard>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved user flashcards from cache for user {UserId}", userId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<Flashcard>()
                    .Select("*, deck!inner(*)")
                    .Filter("deck.created_by", Operator.Equals, userGuid)
                    .Get();

                var flashcards = response.Models;
                
                await _cache.SetAsync(cacheKey, flashcards,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} flashcards for user {UserId}", 
                    flashcards.Count, userId);

                return flashcards;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving flashcards for user {UserId}", userId);
                throw;
            }
        }

        public async Task<string> CreateFlashcardAsync(Flashcard flashcard)
        {
            if (flashcard == null)
            {
                throw new ArgumentNullException(nameof(flashcard));
            }

            try
            {
                flashcard.Id = Guid.NewGuid();
                flashcard.CreatedAt = DateTime.UtcNow;
                flashcard.UpdatedAt = DateTime.UtcNow;

                var response = await _supabaseClient
                    .From<Flashcard>()
                    .Insert(flashcard);

                var createdFlashcard = response.Models.FirstOrDefault();
                if (createdFlashcard == null)
                {
                    throw new InvalidOperationException("No flashcard returned after insertion");
                }

                // Invalidate relevant cache entries
                await InvalidateFlashcardCacheAsync(createdFlashcard);
                _logger.LogInformation("Created new flashcard with ID {Id}", createdFlashcard.Id);

                return createdFlashcard.Id.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating flashcard");
                throw;
            }
        }

        public async Task UpdateFlashcardAsync(string id, Flashcard flashcard)
        {
            if (!Guid.TryParse(id, out var flashcardId))
            {
                throw new ArgumentException("Invalid flashcard ID format", nameof(id));
            }

            if (flashcard == null)
            {
                throw new ArgumentNullException(nameof(flashcard));
            }

            try
            {
                flashcard.UpdatedAt = DateTime.UtcNow;
                var response = await _supabaseClient
                    .From<Flashcard>()
                    .Where(f => f.Id == flashcardId)
                    .Update(flashcard);

                var updatedFlashcard = response.Models.FirstOrDefault();
                if (updatedFlashcard != null)
                {
                    // Invalidate relevant cache entries
                    await InvalidateFlashcardCacheAsync(updatedFlashcard);
                    _logger.LogInformation("Updated flashcard {Id}", id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating flashcard {Id}", id);
                throw;
            }
        }

        public async Task DeleteFlashcardAsync(string id)
        {
            if (!Guid.TryParse(id, out var flashcardId))
            {
                throw new ArgumentException("Invalid flashcard ID format", nameof(id));
            }

            try
            {
                // Get the flashcard first to know which cache keys to invalidate
                var flashcard = await GetFlashcardByIdAsync(id);
                if (flashcard != null)
                {
                    await _supabaseClient
                        .From<Flashcard>()
                        .Where(f => f.Id == flashcardId)
                        .Delete();

                    // Invalidate relevant cache entries
                    await InvalidateFlashcardCacheAsync(flashcard);
                    _logger.LogInformation("Deleted flashcard {Id}", id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting flashcard {Id}", id);
                throw;
            }
        }

        public async Task<List<Flashcard>> GetDueForReviewAsync(string userId, int limit = 20)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            if (limit <= 0)
            {
                throw new ArgumentException("Limit must be greater than 0", nameof(limit));
            }

            var cacheKey = $"{CacheKeyPrefix}due:{userGuid}:{limit}";
            var cached = await _cache.GetAsync<List<Flashcard>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved due flashcards from cache for user {UserId}", userId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<Flashcard>()
                    .Select("*, deck!inner(*)")
                    .Filter("deck.created_by", Operator.Equals, userGuid)
                    .Filter<object>("next_review_at", Operator.Is, null)
                    .Filter("next_review_at", Operator.LessThanOrEqual, DateTime.UtcNow)
                    .Order("next_review_at", Ordering.Ascending)
                    .Order("created_at", Ordering.Ascending)
                    .Limit(limit)
                    .Get();

                var flashcards = response.Models;

                // Cache for a shorter duration since this is time-sensitive
                await _cache.SetAsync(cacheKey, flashcards,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} due flashcards for user {UserId}", 
                    flashcards.Count, userId);

                return flashcards;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving flashcards due for review for user {UserId}", userId);
                throw;
            }
        }

        public async Task UpdateReviewStatusAsync(string id, bool wasCorrect)
        {
            if (!Guid.TryParse(id, out var flashcardId))
            {
                throw new ArgumentException("Invalid flashcard ID format", nameof(id));
            }

            try
            {
                await _supabaseClient.Rpc(
                    "update_flashcard_review_status",
                    new Dictionary<string, object>
                    {
                        { "flashcard_id", flashcardId },
                        { "was_correct", wasCorrect },
                        { "review_time", DateTime.UtcNow }
                    }
                );

                // Invalidate relevant cache entries since the review status changed
                var flashcard = await GetFlashcardByIdAsync(id);
                if (flashcard != null)
                {
                    await InvalidateFlashcardCacheAsync(flashcard);
                }
                _logger.LogInformation("Updated review status for flashcard {Id}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review status for flashcard {Id}", id);
                throw;
            }
        }

        public async Task<List<Flashcard>> GetRandomFlashcardsAsync(int limit = 10)
        {
            try
            {
                var response = await _supabaseClient
                    .From<Flashcard>()
                    .Select("*")
                    .Limit(limit)
                    .Get();

                return response.Models;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving random flashcards");
                throw;
            }
        }

        public async Task<List<Flashcard>> SearchFlashcardsAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return new List<Flashcard>();
            }

            try
            {
                var response = await _supabaseClient
                    .From<Flashcard>()
                    .Filter(f => f.FrontWord, Operator.ILike, $"%{query}%")
                    .Filter(f => f.BackWord, Operator.ILike, $"%{query}%")
                    .Get();

                return response.Models;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching flashcards with query: {Query}", query);
                throw;
            }
        }

        private async Task InvalidateFlashcardCacheAsync(Flashcard flashcard)
        {
            var tasks = new List<Task>
            {
                // Invalidate specific flashcard cache
                _cache.RemoveAsync($"{CacheKeyPrefix}{flashcard.Id}"),
                
                // Invalidate user's flashcard list cache
                _cache.RemoveAsync($"{CacheKeyPrefix}user:{flashcard.DeckId}")
            };

            await Task.WhenAll(tasks);
        }
    }
}
