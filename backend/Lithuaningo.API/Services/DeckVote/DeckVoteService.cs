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
        private const string VoteCachePrefix = "deck-vote:";
        private const string DeckCachePrefix = "deck:";
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
                _logger.LogInformation("[InvalidateVoteCacheAsync] Starting cache invalidation for deck {DeckId}, user {UserId}", 
                    deckId, userId);
                    
                var userVoteKey = $"{VoteCachePrefix}deck:{deckId}:user:{userId}";
                var deckVotesKey = $"{VoteCachePrefix}deck:{deckId}";
                var deckCountsKey = $"{VoteCachePrefix}counts:{deckId}";

                await _cache.RemoveAsync(userVoteKey);
                await _cache.RemoveAsync(deckVotesKey);
                await _cache.RemoveAsync(deckCountsKey);
                
                _logger.LogInformation("[InvalidateVoteCacheAsync] Cache invalidation completed");
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
                _logger.LogInformation("[InvalidateDeckCacheAsync] Starting deck cache invalidation for deck {DeckId}", deck.Id);
                
                // Get all possible cache keys that might contain this deck
                var keys = new List<string>
                {
                    // Single deck cache
                    $"{DeckCachePrefix}{deck.Id}",
                    
                    // User decks cache
                    $"{DeckCachePrefix}user:{deck.UserId}",
                    
                    // All decks cache
                    $"{DeckCachePrefix}list:all:0",
                    
                    // Category-specific cache
                    $"{DeckCachePrefix}list:{deck.Category}:0",
                    
                    // Top rated decks cache (all variations)
                    $"{DeckCachePrefix}top:10:all",
                    $"{DeckCachePrefix}top:10:week",
                    $"{DeckCachePrefix}top:10:month",
                    $"{DeckCachePrefix}top:10:year"
                };

                foreach (var key in keys)
                {
                    _logger.LogInformation("[InvalidateDeckCacheAsync] Removing cache for key: {Key}", key);
                    await _cache.RemoveAsync(key);
                }
                
                _logger.LogInformation("[InvalidateDeckCacheAsync] Deck cache invalidation completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[InvalidateDeckCacheAsync] Error invalidating deck cache");
                throw;
            }
        }
    }
} 