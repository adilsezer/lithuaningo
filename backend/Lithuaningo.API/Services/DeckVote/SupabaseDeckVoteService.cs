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
    public class SupabaseDeckVoteService : IDeckVoteService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "deck-vote:";
        private readonly ILogger<SupabaseDeckVoteService> _logger;

        public SupabaseDeckVoteService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<SupabaseDeckVoteService> logger)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> VoteDeckAsync(Guid deckId, Guid userId, bool isUpvote)
        {
            try
            {
                // Check for existing vote
                var existingVoteResponse = await _supabaseClient
                    .From<DeckVote>()
                    .Filter(v => v.DeckId, Operator.Equals, deckId)
                    .Filter(v => v.UserId, Operator.Equals, userId)
                    .Get();

                if (existingVoteResponse.Models.Any())
                {
                    var vote = existingVoteResponse.Models.First();
                    if (vote.IsUpvote == isUpvote)
                    {
                        return true;
                    }

                    // Update existing vote
                    await _supabaseClient
                        .From<DeckVote>()
                        .Where(v => v.Id == vote.Id)
                        .Set(v => v.IsUpvote, isUpvote)
                        .Set(v => v.UpdatedAt, DateTime.UtcNow)
                        .Update();
                }
                else
                {
                    // Create new vote
                    var vote = new DeckVote
                    {
                        Id = Guid.NewGuid(),
                        DeckId = deckId,
                        UserId = userId,
                        IsUpvote = isUpvote,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    await _supabaseClient
                        .From<DeckVote>()
                        .Insert(vote);
                }

                // Invalidate relevant cache entries
                await InvalidateVoteCacheAsync(deckId, userId);
                _logger.LogInformation("Updated vote for deck {DeckId} by user {UserId}", deckId, userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error voting for deck {DeckId} by user {UserId}", deckId, userId);
                throw;
            }
        }

        public async Task<DeckVote?> GetUserVoteAsync(Guid deckId, Guid userId)
        {
            var cacheKey = $"{CacheKeyPrefix}deck:{deckId}:user:{userId}";
            var cached = await _cache.GetAsync<DeckVote>(cacheKey);

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
                    .Filter(v => v.DeckId, Operator.Equals, deckId)
                    .Filter(v => v.UserId, Operator.Equals, userId)
                    .Get();

                var vote = response.Models.FirstOrDefault();
                if (vote != null)
                {
                    await _cache.SetAsync(cacheKey, vote,
                        TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                    _logger.LogInformation("Retrieved and cached vote for deck {DeckId} and user {UserId}", 
                        deckId, userId);
                }

                return vote;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving vote for deck {DeckId} and user {UserId}", 
                    deckId, userId);
                throw;
            }
        }

        public async Task<List<DeckVote>> GetDeckVotesAsync(Guid deckId)
        {
            var cacheKey = $"{CacheKeyPrefix}deck:{deckId}";
            var cached = await _cache.GetAsync<List<DeckVote>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved votes from cache for deck {DeckId}", deckId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<DeckVote>()
                    .Filter(v => v.DeckId, Operator.Equals, deckId)
                    .Get();

                var votes = response.Models;
                await _cache.SetAsync(cacheKey, votes,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} votes for deck {DeckId}", 
                    votes.Count, deckId);

                return votes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving votes for deck {DeckId}", deckId);
                throw;
            }
        }

        public async Task<(int upvotes, int downvotes)> GetDeckVoteCountsAsync(Guid deckId)
        {
            try
            {
                var votes = await GetDeckVotesAsync(deckId);
                var upvotes = votes.Count(v => v.IsUpvote);
                var downvotes = votes.Count - upvotes;

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
                    .Filter(v => v.DeckId, Operator.Equals, deckId);

                // Filter votes by time range if needed
                if (timeRange != "all")
                {
                    var startDate = timeRange.ToLower() switch
                    {
                        "week" => DateTime.UtcNow.AddDays(-7),
                        "month" => DateTime.UtcNow.AddMonths(-1),
                        _ => DateTime.MinValue
                    };

                    query = query.Filter(v => v.CreatedAt, Operator.GreaterThanOrEqual, startDate);
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
            var tasks = new List<Task>
            {
                // Invalidate specific user vote cache
                _cache.RemoveAsync($"{CacheKeyPrefix}deck:{deckId}:user:{userId}"),
                
                // Invalidate deck votes list cache
                _cache.RemoveAsync($"{CacheKeyPrefix}deck:{deckId}")
            };

            await Task.WhenAll(tasks);
        }
    }
} 