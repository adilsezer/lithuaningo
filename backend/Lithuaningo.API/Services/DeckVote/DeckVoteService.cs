using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.DeckVote;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using static Supabase.Postgrest.Constants;
using Supabase;
using AutoMapper;

namespace Lithuaningo.API.Services
{
    public class DeckVoteService : IDeckVoteService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "deck-vote:";
        private readonly ILogger<DeckVoteService> _logger;
        private readonly IMapper _mapper;

        public DeckVoteService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<DeckVoteService> logger,
            IMapper mapper)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<bool> VoteDeckAsync(Guid deckId, Guid userId, bool isUpvote)
        {
            try
            {
                var existingVote = await GetUserVoteAsync(deckId, userId);
                if (existingVote != null)
                {
                    if (existingVote.IsUpvote == isUpvote)
                    {
                        return true;
                    }

                    var updateResponse = await _supabaseClient
                        .From<DeckVote>()
                        .Where(v => v.Id == existingVote.Id)
                        .Update(new DeckVote 
                        { 
                            Id = existingVote.Id,
                            DeckId = existingVote.DeckId,
                            UserId = existingVote.UserId,
                            IsUpvote = isUpvote,
                            CreatedAt = existingVote.CreatedAt,
                            UpdatedAt = DateTime.UtcNow
                        });

                    if (!updateResponse.Models.Any())
                    {
                        throw new Exception("Failed to update vote");
                    }
                }
                else
                {
                    var vote = new DeckVote
                    {
                        Id = Guid.NewGuid(),
                        DeckId = deckId,
                        UserId = userId,
                        IsUpvote = isUpvote,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    var response = await _supabaseClient
                        .From<DeckVote>()
                        .Insert(vote);

                    if (!response.Models.Any())
                    {
                        throw new Exception("Failed to create vote");
                    }
                }

                await InvalidateVoteCacheAsync(deckId, userId);
                await InvalidateDeckCacheAsync(deckId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error voting for deck {DeckId} by user {UserId}", deckId, userId);
                throw;
            }
        }

        public async Task RemoveVoteAsync(Guid deckId, Guid userId)
        {
            try
            {
                await _supabaseClient
                    .From<DeckVote>()
                    .Where(v => v.DeckId == deckId)
                    .Where(v => v.UserId == userId)
                    .Delete();

                await InvalidateVoteCacheAsync(deckId, userId);
                _logger.LogInformation("Removed vote for deck {DeckId} by user {UserId}", deckId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing vote for deck {DeckId} by user {UserId}", deckId, userId);
                throw;
            }
        }

        public async Task<DeckVoteResponse?> GetUserVoteAsync(Guid deckId, Guid userId)
        {
            var cacheKey = $"{CacheKeyPrefix}deck:{deckId}:user:{userId}";
            var cached = await _cache.GetAsync<DeckVoteResponse>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved user vote from cache for deck {DeckId} and user {UserId}", 
                    deckId, userId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<DeckVote>()
                    .Where(v => v.DeckId == deckId)
                    .Where(v => v.UserId == userId)
                    .Get();

                var vote = response.Models.FirstOrDefault();
                if (vote != null)
                {
                    var voteResponse = _mapper.Map<DeckVoteResponse>(vote);
                    await _cache.SetAsync(cacheKey, voteResponse,
                        TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                    _logger.LogInformation("Retrieved and cached vote for deck {DeckId} and user {UserId}", 
                        deckId, userId);
                    return voteResponse;
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving vote for deck {DeckId} and user {UserId}", 
                    deckId, userId);
                throw;
            }
        }

        public async Task<List<DeckVoteResponse>> GetDeckVotesAsync(Guid deckId)
        {
            var cacheKey = $"{CacheKeyPrefix}deck:{deckId}";
            var cached = await _cache.GetAsync<List<DeckVoteResponse>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved votes from cache for deck {DeckId}", deckId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<DeckVote>()
                    .Where(v => v.DeckId == deckId)
                    .Select("*")
                    .Get();

                var voteResponses = _mapper.Map<List<DeckVoteResponse>>(response.Models);
                
                await _cache.SetAsync(cacheKey, voteResponses,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));

                return voteResponses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving votes for deck {DeckId}", deckId);
                throw;
            }
        }

        public async Task<(int upvotes, int downvotes)> GetDeckVoteCountsAsync(Guid deckId)
        {
            if (deckId == Guid.Empty)
            {
                throw new ArgumentException("Deck ID is required", nameof(deckId));
            }

            try
            {
                var votes = await _supabaseClient
                    .From<DeckVote>()
                    .Where(v => v.DeckId == deckId)
                    .Get();

                var upvotes = votes.Models.Count(v => v.IsUpvote);
                var downvotes = votes.Models.Count - upvotes;

                return (upvotes, downvotes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating vote counts for deck {DeckId}", deckId);
                throw;
            }
        }

        public async Task<double> CalculateDeckRatingAsync(Guid deckId, string timeRange = "all")
        {
            try
            {
                var query = _supabaseClient
                    .From<DeckVote>()
                    .Where(v => v.DeckId == deckId);

                // Filter votes by time range if needed
                if (timeRange != "all")
                {
                    var startDate = timeRange.ToLower() switch
                    {
                        "week" => DateTime.UtcNow.AddDays(-7),
                        "month" => DateTime.UtcNow.AddMonths(-1),
                        _ => DateTime.MinValue
                    };

                    query = query.Where(v => v.CreatedAt >= startDate);
                }

                var votesResponse = await query.Get();

                if (!votesResponse.Models.Any())
                {
                    return 0.0;
                }

                int totalVotes = votesResponse.Models.Count;
                int upvotes = votesResponse.Models.Count(v => v.IsUpvote);

                return (double)upvotes / totalVotes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating rating for deck {DeckId}", deckId);
                throw;
            }
        }

        private async Task InvalidateVoteCacheAsync(Guid deckId, Guid userId)
        {
            var userVoteKey = $"{CacheKeyPrefix}user:{deckId}:{userId}";
            var deckVotesKey = $"{CacheKeyPrefix}deck:{deckId}";
            var deckCountsKey = $"{CacheKeyPrefix}counts:{deckId}";

            await _cache.RemoveAsync(userVoteKey);
            await _cache.RemoveAsync(deckVotesKey);
            await _cache.RemoveAsync(deckCountsKey);
        }

        private async Task InvalidateDeckCacheAsync(Guid deckId)
        {
            // Invalidate all possible deck cache keys that might contain this deck
            var keys = new[]
            {
                $"{CacheKeyPrefix}top:",  // Top rated decks cache
                $"{CacheKeyPrefix}{deckId}",  // Single deck cache
                $"{CacheKeyPrefix}user:",  // User decks cache
                $"{CacheKeyPrefix}"  // Public decks cache
            };

            foreach (var key in keys)
            {
                await _cache.RemoveAsync(key);
            }
        }
    }
} 