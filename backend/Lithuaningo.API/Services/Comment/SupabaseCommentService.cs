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
    public class SupabaseCommentService : ICommentService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "comment:";
        private readonly ILogger<SupabaseCommentService> _logger;

        public SupabaseCommentService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<SupabaseCommentService> logger)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<List<Comment>> GetDeckCommentsAsync(string deckId)
        {
            if (!Guid.TryParse(deckId, out var deckGuid))
            {
                throw new ArgumentException("Invalid deck ID format", nameof(deckId));
            }

            var cacheKey = $"{CacheKeyPrefix}deck:{deckGuid}";
            var cached = await _cache.GetAsync<List<Comment>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved deck comments from cache for deck {DeckId}", deckId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<Comment>()
                    .Filter("deck_id", Operator.Equals, deckGuid)
                    .Order("created_at", Ordering.Descending)
                    .Get();

                var comments = response.Models;

                await _cache.SetAsync(cacheKey, comments,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} comments for deck {DeckId}", 
                    comments.Count, deckId);

                return comments;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving comments for deck {DeckId}", deckId);
                throw;
            }
        }

        public async Task<Comment?> GetCommentByIdAsync(string id)
        {
            if (!Guid.TryParse(id, out var commentId))
            {
                throw new ArgumentException("Invalid comment ID format", nameof(id));
            }

            var cacheKey = $"{CacheKeyPrefix}{commentId}";
            var cached = await _cache.GetAsync<Comment>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved comment {Id} from cache", id);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<Comment>()
                    .Where(c => c.Id == commentId)
                    .Get();

                var comment = response.Models.FirstOrDefault();
                if (comment != null)
                {
                    await _cache.SetAsync(cacheKey, comment,
                        TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                    _logger.LogInformation("Retrieved and cached comment {Id}", id);
                }
                else
                {
                    _logger.LogInformation("Comment {Id} not found", id);
                }

                return comment;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving comment {Id}", id);
                throw;
            }
        }

        public async Task<Comment> CreateCommentAsync(Comment comment)
        {
            if (comment == null)
            {
                throw new ArgumentNullException(nameof(comment));
            }

            try
            {
                comment.Id = Guid.NewGuid();
                comment.CreatedAt = DateTime.UtcNow;
                comment.UpdatedAt = DateTime.UtcNow;
                comment.IsEdited = false;

                var response = await _supabaseClient
                    .From<Comment>()
                    .Insert(comment);

                var createdComment = response.Models.First();

                // Invalidate relevant cache entries
                await InvalidateCommentCacheAsync(createdComment);
                _logger.LogInformation("Created new comment with ID {Id} for deck {DeckId}", 
                    createdComment.Id, createdComment.DeckId);

                return createdComment;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating comment");
                throw;
            }
        }

        public async Task<Comment> UpdateCommentAsync(Comment comment)
        {
            if (comment == null)
            {
                throw new ArgumentNullException(nameof(comment));
            }

            try
            {
                comment.UpdatedAt = DateTime.UtcNow;
                comment.IsEdited = true;
                comment.EditedAt = DateTime.UtcNow;

                var response = await _supabaseClient
                    .From<Comment>()
                    .Where(c => c.Id == comment.Id)
                    .Update(comment);

                var updatedComment = response.Models.First();

                // Invalidate relevant cache entries
                await InvalidateCommentCacheAsync(updatedComment);
                _logger.LogInformation("Updated comment {Id}", comment.Id);

                return updatedComment;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating comment {Id}", comment.Id);
                throw;
            }
        }

        public async Task<bool> DeleteCommentAsync(string id)
        {
            if (!Guid.TryParse(id, out var commentId))
            {
                throw new ArgumentException("Invalid comment ID format", nameof(id));
            }

            try
            {
                // Get the comment first to know which cache keys to invalidate
                var comment = await GetCommentByIdAsync(id);
                if (comment == null)
                {
                    _logger.LogInformation("Comment {Id} not found for deletion", id);
                    return false;
                }

                await _supabaseClient
                    .From<Comment>()
                    .Where(c => c.Id == commentId)
                    .Delete();

                // Invalidate relevant cache entries
                await InvalidateCommentCacheAsync(comment);
                _logger.LogInformation("Deleted comment {Id}", id);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting comment {Id}", id);
                throw;
            }
        }

        public async Task<List<Comment>> GetUserCommentsAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            var cacheKey = $"{CacheKeyPrefix}user:{userGuid}";
            var cached = await _cache.GetAsync<List<Comment>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved user comments from cache for user {UserId}", userId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<Comment>()
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

        private async Task InvalidateCommentCacheAsync(Comment comment)
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
