using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.DeckComment;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using static Supabase.Postgrest.Constants;
using Supabase;
using AutoMapper;

namespace Lithuaningo.API.Services
{
    public class DeckCommentService : IDeckCommentService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "deck-comment:";
        private readonly ILogger<DeckCommentService> _logger;
        private readonly IMapper _mapper;

        public DeckCommentService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<DeckCommentService> logger,
            IMapper mapper)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<List<DeckCommentResponse>> GetDeckCommentsAsync(string deckId)
        {
            if (!Guid.TryParse(deckId, out var deckGuid))
            {
                throw new ArgumentException("Invalid deck ID format", nameof(deckId));
            }

            var cacheKey = $"{CacheKeyPrefix}deck:{deckGuid}";
            var cached = await _cache.GetAsync<List<DeckCommentResponse>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved deck comments from cache for deck {DeckId}", deckId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<DeckComment>()
                    .Where(d => d.DeckId == deckGuid)
                    .Order("created_at", Ordering.Descending)
                    .Get();

                var comments = response.Models;
                var commentResponses = _mapper.Map<List<DeckCommentResponse>>(comments);

                await _cache.SetAsync(cacheKey, commentResponses,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} deck comments for deck {DeckId}", 
                    comments.Count, deckId);

                return commentResponses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving deck comments for deck {DeckId}", deckId);
                throw;
            }
        }

        public async Task<DeckCommentResponse?> GetDeckCommentByIdAsync(string deckCommentId)
        {
            if (!Guid.TryParse(deckCommentId, out var commentGuid))
            {
                throw new ArgumentException("Invalid deck comment ID format", nameof(deckCommentId));
            }

            var cacheKey = $"{CacheKeyPrefix}{commentGuid}";
            var cached = await _cache.GetAsync<DeckCommentResponse>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved deck comment {Id} from cache", deckCommentId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<DeckComment>()
                    .Where(c => c.Id == commentGuid)
                    .Get();

                var comment = response.Models.FirstOrDefault();
                if (comment != null)
                {
                    var commentResponse = _mapper.Map<DeckCommentResponse>(comment);
                    await _cache.SetAsync(cacheKey, commentResponse,
                        TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                    _logger.LogInformation("Retrieved and cached deck comment {Id}", deckCommentId);
                    return commentResponse;
                }

                _logger.LogInformation("Deck comment {Id} not found", deckCommentId);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving deck comment {Id}", deckCommentId);
                throw;
            }
        }

        public async Task<DeckCommentResponse> CreateDeckCommentAsync(CreateDeckCommentRequest request)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            try
            {
                var comment = new DeckComment
                {
                    Id = Guid.NewGuid(),
                    DeckId = request.DeckId,
                    UserId = request.UserId,
                    Content = request.Content,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var response = await _supabaseClient
                    .From<DeckComment>()
                    .Insert(comment);

                var createdComment = response.Models.First();
                var commentResponse = _mapper.Map<DeckCommentResponse>(createdComment);

                // Invalidate relevant cache entries
                await InvalidateCommentCacheAsync(createdComment);
                _logger.LogInformation("Created new deck comment with ID {Id} for deck {DeckId}", 
                    createdComment.Id, createdComment.DeckId);

                return commentResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating deck comment");
                throw;
            }
        }

        public async Task<DeckCommentResponse> UpdateDeckCommentAsync(string id, UpdateDeckCommentRequest request)
        {
            if (!Guid.TryParse(id, out var commentId))
            {
                throw new ArgumentException("Invalid deck comment ID format", nameof(id));
            }

            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            try
            {
                var existingComment = await _supabaseClient
                    .From<DeckComment>()
                    .Where(c => c.Id == commentId)
                    .Get();

                var comment = existingComment.Models.FirstOrDefault();
                if (comment == null)
                {
                    throw new ArgumentException("Comment not found", nameof(id));
                }

                comment.Content = request.Content;
                comment.UpdatedAt = DateTime.UtcNow;

                var response = await _supabaseClient
                    .From<DeckComment>()
                    .Where(c => c.Id == commentId)
                    .Update(comment);

                var updatedComment = response.Models.First();
                var commentResponse = _mapper.Map<DeckCommentResponse>(updatedComment);

                // Invalidate relevant cache entries
                await InvalidateCommentCacheAsync(updatedComment);
                _logger.LogInformation("Updated deck comment {Id}", id);

                return commentResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating deck comment {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteDeckCommentAsync(string deckCommentId)
        {
            if (!Guid.TryParse(deckCommentId, out var commentId))
            {
                throw new ArgumentException("Invalid deck comment ID format", nameof(deckCommentId));
            }

            try
            {
                // Get the comment first to know which cache keys to invalidate
                var comment = await GetDeckCommentByIdAsync(deckCommentId);
                if (comment == null)
                {
                    _logger.LogInformation("Deck comment {Id} not found for deletion", deckCommentId);
                    return false;
                }

                await _supabaseClient
                    .From<DeckComment>()
                    .Where(c => c.Id == commentId)
                    .Delete();

                // Invalidate cache entries using the response data directly
                await _cache.RemoveAsync($"{CacheKeyPrefix}{comment.Id}");
                await _cache.RemoveAsync($"{CacheKeyPrefix}deck:{comment.DeckId}");
                await _cache.RemoveAsync($"{CacheKeyPrefix}user:{comment.UserId}");

                _logger.LogInformation("Deleted deck comment {Id}", deckCommentId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting deck comment {Id}", deckCommentId);
                throw;
            }
        }

        public async Task<List<DeckCommentResponse>> GetUserDeckCommentsAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            var cacheKey = $"{CacheKeyPrefix}user:{userGuid}";
            var cached = await _cache.GetAsync<List<DeckCommentResponse>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved user comments from cache for user {UserId}", userId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<DeckComment>()
                    .Where(c => c.UserId == userGuid)
                    .Order("created_at", Ordering.Descending)
                    .Get();

                var comments = response.Models;
                var commentResponses = _mapper.Map<List<DeckCommentResponse>>(comments);

                await _cache.SetAsync(cacheKey, commentResponses,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} comments for user {UserId}", 
                    comments.Count, userId);

                return commentResponses;
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
