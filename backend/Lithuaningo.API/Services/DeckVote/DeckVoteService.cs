using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.DeckVote;
using Lithuaningo.API.DTOs.Deck;
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
        private readonly IMapper _mapper;
        private readonly ILogger<DeckVoteService> _logger;
        private const string VoteCachePrefix = "vote:";
        private const string DeckCachePrefix = "deck:";
        private readonly CacheInvalidator _cacheInvalidator;

        public DeckVoteService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            IMapper mapper,
            ILogger<DeckVoteService> logger,
            CacheInvalidator cacheInvalidator)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _cacheInvalidator = cacheInvalidator ?? throw new ArgumentNullException(nameof(cacheInvalidator));
        }

        public async Task<bool> VoteDeckAsync(Guid deckId, Guid userId, bool isUpvote)
        {
            try
            {
                _logger.LogInformation("[VoteDeckAsync] Starting vote operation for deck {DeckId} by user {UserId}", deckId, userId);
                
                // Get the deck to make sure it exists
                var deck = await _supabaseClient
                    .From<Deck>()
                    .Where(d => d.Id == deckId)
                    .Single();
                
                if (deck == null)
                {
                    _logger.LogError("[VoteDeckAsync] Deck {DeckId} not found", deckId);
                    throw new KeyNotFoundException($"Deck with ID {deckId} not found");
                }
                
                // Map to DeckResponse for cache invalidation
                var deckResponse = _mapper.Map<DeckResponse>(deck);

                var existingVote = await GetUserVoteAsync(deckId, userId);
                if (existingVote != null)
                {
                    if (existingVote.IsUpvote == isUpvote)
                    {
                        _logger.LogInformation("[VoteDeckAsync] User already voted this way");
                        return true;
                    }

                    _logger.LogInformation("[VoteDeckAsync] Updating existing vote");
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
                        _logger.LogError("[VoteDeckAsync] Failed to update vote in database");
                        throw new Exception("Failed to update vote");
                    }
                    _logger.LogInformation("[VoteDeckAsync] Vote updated successfully");
                }
                else
                {
                    _logger.LogInformation("[VoteDeckAsync] Creating new vote");
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
                        _logger.LogError("[VoteDeckAsync] Failed to create vote in database");
                        throw new Exception("Failed to create vote");
                    }
                    _logger.LogInformation("[VoteDeckAsync] New vote created successfully");
                }

                _logger.LogInformation("[VoteDeckAsync] Invalidating caches");
                await InvalidateVoteCacheAsync(deckId, userId);
                await InvalidateDeckCacheAsync(deckResponse);
                _logger.LogInformation("[VoteDeckAsync] Vote operation completed successfully");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[VoteDeckAsync] Error voting for deck {DeckId} by user {UserId}", deckId, userId);
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
            var cacheKey = $"{VoteCachePrefix}deck:{deckId}:user:{userId}";
            var cached = await _cache.GetAsync<DeckVoteResponse>(cacheKey);

            if (cached != null)
            {
                // If vote was updated in the last 30 seconds, don't use cache
                if (cached.UpdatedAt > DateTime.UtcNow.AddSeconds(-30))
                {
                    _logger.LogInformation("Vote was recently updated, fetching fresh data for deck {DeckId} and user {UserId}", 
                        deckId, userId);
                    // Skip cache for recently updated votes
                }
                else
                {
                    _logger.LogInformation("Retrieved user vote from cache for deck {DeckId} and user {UserId}", 
                        deckId, userId);
                    return cached;
                }
            }

            try
            {
                var response = await _supabaseClient
                    .From<DeckVote>()
                    .Where(v => v.DeckId == deckId)
                    .Where(v => v.UserId == userId)
                    .Get();

                var votes = response.Models;
                if (votes.Any())
                {
                    var vote = votes.First();
                    var voteResponse = _mapper.Map<DeckVoteResponse>(vote);
                    
                    // Cache the result for future requests (with expiration)
                    await _cache.SetAsync(cacheKey, voteResponse);
                    
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
            var cacheKey = $"{VoteCachePrefix}deck:{deckId}";
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
                // Always get fresh data from the database for vote counts
                // to ensure we have the most up-to-date information
                _logger.LogInformation("[GetDeckVoteCountsAsync] Getting fresh vote counts from database for deck {DeckId}", deckId);
                
                var votes = await _supabaseClient
                    .From<DeckVote>()
                    .Where(v => v.DeckId == deckId)
                    .Get();

                var upvotes = votes.Models.Count(v => v.IsUpvote);
                var downvotes = votes.Models.Count - upvotes;

                _logger.LogInformation("[GetDeckVoteCountsAsync] Vote counts for deck {DeckId}: upvotes={Upvotes}, downvotes={Downvotes}", 
                    deckId, upvotes, downvotes);
                
                return (upvotes, downvotes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating vote counts for deck {DeckId}", deckId);
                throw;
            }
        }

        public async Task<double> CalculateDeckRatingAsync(Guid deckId)
        {
            try
            {
                _logger.LogInformation("[CalculateDeckRatingAsync] Calculating rating for deck {DeckId}", deckId);
                
                var (upvotes, downvotes) = await GetDeckVoteCountsAsync(deckId);
                var totalVotes = upvotes + downvotes;

                if (totalVotes == 0)
                {
                    _logger.LogInformation("[CalculateDeckRatingAsync] No votes found, returning 0");
                    return 0.0;
                }

                var rating = (double)upvotes / totalVotes;
                _logger.LogInformation("[CalculateDeckRatingAsync] Rating calculated: {Rating} (upvotes: {Upvotes}, total: {Total})", 
                    rating, upvotes, totalVotes);
                    
                return rating;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating rating for deck {DeckId}", deckId);
                throw;
            }
        }

        private async Task InvalidateVoteCacheAsync(Guid deckId, Guid userId)
        {
            try
            {
                await _cacheInvalidator.InvalidateVotesAsync(deckId.ToString(), userId.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[InvalidateVoteCacheAsync] Error invalidating vote cache");
                throw;
            }
        }

        private async Task InvalidateDeckCacheAsync(DeckResponse deck)
        {
            try
            {
                await _cacheInvalidator.InvalidateDeckAsync(deck.Id.ToString(), deck.UserId.ToString());
                
                // Also invalidate the top-rated decks cache
                await _cacheInvalidator.InvalidateTopRatedDecksAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[InvalidateDeckCacheAsync] Error invalidating deck cache");
                throw;
            }
        }
    }
} 