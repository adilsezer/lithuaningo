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
    public class SupabaseDeckCommentService : IDeckCommentService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "deck_comment:";
        private readonly ILogger<SupabaseDeckCommentService> _logger;

        public SupabaseDeckCommentService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<SupabaseDeckCommentService> logger)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<List<DeckComment>> GetDeckCommentsAsync(string deckId)
        {
            if (!Guid.TryParse(deckId, out var deckGuid))
            {
                throw new ArgumentException("Invalid deck ID format", nameof(deckId));
            }

            var cacheKey = $"{CacheKeyPrefix}deck:{deckGuid}";
            var cached = await _cache.GetAsync<List<DeckComment>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved deck comments from cache for deck {DeckId}", deckId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<DeckComment>()
                    .Filter("deck_id", Operator.Equals, deckGuid)
                    .Order("created_at", Ordering.Descending)
                    .Get();

                var deckComments = response.Models;

                await _cache.SetAsync(cacheKey, deckComments,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} deck comments for deck {DeckId}", 
                    deckComments.Count, deckId);

                return deckComments;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving deck comments for deck {DeckId}", deckId);
                throw;
            }
        }

        public async Task<DeckComment?> GetDeckCommentByIdAsync(string id)
        {
            if (!Guid.TryParse(id, out var deckCommentId))
            {
                throw new ArgumentException("Invalid deck comment ID format", nameof(id));
            }

            var cacheKey = $"{CacheKeyPrefix}{deckCommentId}";
            var cached = await _cache.GetAsync<DeckComment>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved deck comment {Id} from cache", id);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<DeckComment>()
                    .Where(c => c.Id == deckCommentId)
                    .Get();

                var deckComment = response.Models.FirstOrDefault();
                if (deckComment != null)
                {
                    await _cache.SetAsync(cacheKey, deckComment,
                        TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                    _logger.LogInformation("Retrieved and cached deck comment {Id}", id);
                }
                else
                {
                    _logger.LogInformation("Deck comment {Id} not found", id);
                }

                return deckComment;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving deck comment {Id}", id);
                throw;
            }
        }

        public async Task<DeckComment> CreateDeckCommentAsync(DeckComment deckComment)
        {
            if (deckComment == null)
            {
                throw new ArgumentNullException(nameof(deckComment));
            }

            try
            {
                deckComment.Id = Guid.NewGuid();
                deckComment.CreatedAt = DateTime.UtcNow;
                deckComment.UpdatedAt = DateTime.UtcNow;

                var response = await _supabaseClient
                    .From<DeckComment>()
                    .Insert(deckComment);

                var createdComment = response.Models.First();

                // Invalidate relevant cache entries
                await InvalidateCommentCacheAsync(createdComment);
                _logger.LogInformation("Created new deck comment with ID {Id} for deck {DeckId}", 
                    createdComment.Id, createdComment.DeckId);

                return createdComment;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating deck comment");
                throw;
            }
        }

        public async Task<DeckComment> UpdateDeckCommentAsync(DeckComment deckComment)
        {
            if (deckComment == null)
            {
                throw new ArgumentNullException(nameof(deckComment));
            }

            try
            {
                deckComment.UpdatedAt = DateTime.UtcNow;

                var response = await _supabaseClient
                    .From<DeckComment>()
                    .Where(c => c.Id == deckComment.Id)
                    .Update(deckComment);

                var updatedComment = response.Models.First();

                // Invalidate relevant cache entries
                await InvalidateCommentCacheAsync(updatedComment);
                _logger.LogInformation("Updated deck comment {Id}", deckComment.Id);

                return updatedComment;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating deck comment {Id}", deckComment.Id);
                throw;
            }
        }

        public async Task<bool> DeleteDeckCommentAsync(string id)
        {
            if (!Guid.TryParse(id, out var deckCommentId))
            {
                throw new ArgumentException("Invalid deck comment ID format", nameof(id));
            }

            try
            {
                // Get the comment first to know which cache keys to invalidate
                var deckComment = await GetDeckCommentByIdAsync(id);
                if (deckComment == null)
                {
                    _logger.LogInformation("Deck comment {Id} not found for deletion", id);
                    return false;
                }

                await _supabaseClient
                    .From<DeckComment>()
                    .Where(c => c.Id == deckCommentId)
                    .Delete();

                // Invalidate relevant cache entries
                await InvalidateCommentCacheAsync(deckComment);
                _logger.LogInformation("Deleted deck comment {Id}", id);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting deck comment {Id}", id);
                throw;
            }
        }

        public async Task<List<DeckComment>> GetUserDeckCommentsAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            var cacheKey = $"{CacheKeyPrefix}user:{userGuid}";
            var cached = await _cache.GetAsync<List<DeckComment>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved user comments from cache for user {UserId}", userId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<DeckComment>()
                    .Filter("user_id", Operator.Equals, userGuid)
                    .Order("created_at", Ordering.Descending)
                    .Get();

                var comments = response.Models;

                await _cache.SetAsync(cacheKey, comments,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} comments for user {UserId}", 
                    comments.Count, userId);

                return comments;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving comments for user {UserId}", userId);
                throw;
            }
        }

        private async Task InvalidateCommentCacheAsync(DeckComment comment)
        {
            var tasks = new List<Task>
            {
                // Invalidate specific comment cache
                _cache.RemoveAsync($"{CacheKeyPrefix}{comment.Id}"),
                
                // Invalidate deck's comments list cache
                _cache.RemoveAsync($"{CacheKeyPrefix}deck:{comment.DeckId}"),
                
                // Invalidate user's comments list cache
                _cache.RemoveAsync($"{CacheKeyPrefix}user:{comment.UserId}")
            };

            await Task.WhenAll(tasks);
        }
    }
}
