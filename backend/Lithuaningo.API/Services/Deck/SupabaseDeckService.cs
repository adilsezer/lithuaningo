using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Interfaces;
using static Supabase.Postgrest.Constants;
using Supabase;

namespace Lithuaningo.API.Services
{
    public class SupabaseDeckService : IDeckService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "deck:";
        private readonly ILogger<SupabaseDeckService> _logger;

        public SupabaseDeckService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<SupabaseDeckService> logger)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<List<Deck>> GetDecksAsync(string? category = null, int? limit = null)
        {
            var cacheKey = $"{CacheKeyPrefix}list:{category ?? "all"}:{limit ?? 0}";
            var cached = await _cache.GetAsync<List<Deck>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved decks from cache with category: {Category} and limit: {Limit}", 
                    category, limit);
                return cached;
            }

            try
            {
                var query = _supabaseClient
                    .From<Deck>()
                    .Filter(d => d.IsPublic, Operator.Equals, true);

                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Filter(d => d.Category, Operator.Equals, category);
                }

                if (limit.HasValue)
                {
                    query = query.Limit(limit.Value);
                }

                var response = await query.Get();
                var decks = response.Models;

                await _cache.SetAsync(cacheKey, decks,
                    TimeSpan.FromMinutes(_cacheSettings.DeckCacheMinutes));
                _logger.LogInformation("Retrieved and cached {Count} decks with category: {Category} and limit: {Limit}",
                    decks.Count, category, limit);

                return decks;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving decks with category: {Category} and limit: {Limit}", 
                    category, limit);
                throw;
            }
        }

        public async Task<Deck?> GetDeckByIdAsync(string id)
        {
            if (!Guid.TryParse(id, out var deckGuid))
            {
                throw new ArgumentException("Invalid deck ID format", nameof(id));
            }

            var cacheKey = $"{CacheKeyPrefix}{deckGuid}";
            var cached = await _cache.GetAsync<Deck>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved deck {Id} from cache", id);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<Deck>()
                    .Where(d => d.Id == deckGuid)
                    .Get();

                var deck = response.Models.FirstOrDefault();
                if (deck != null)
                {
                    await _cache.SetAsync(cacheKey, deck,
                        TimeSpan.FromMinutes(_cacheSettings.DeckCacheMinutes));
                    _logger.LogInformation("Retrieved and cached deck {Id}", id);
                }
                else
                {
                    _logger.LogInformation("Deck {Id} not found", id);
                }

                return deck;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving deck {Id}", id);
                throw;
            }
        }

        public async Task<List<Deck>> GetUserDecksAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            var cacheKey = $"{CacheKeyPrefix}user:{userGuid}";
            var cached = await _cache.GetAsync<List<Deck>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved user decks from cache for user {UserId}", userId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<Deck>()
                    .Where(d => d.UserId == userGuid)
                    .Get();

                var decks = response.Models;

                await _cache.SetAsync(cacheKey, decks,
                    TimeSpan.FromMinutes(_cacheSettings.DeckCacheMinutes));
                _logger.LogInformation("Retrieved and cached {Count} decks for user {UserId}", 
                    decks.Count, userId);

                return decks;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving decks for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<Deck>> GetTopRatedDecksAsync(int limit = 10, string timeRange = "all")
        {
            var cacheKey = $"{CacheKeyPrefix}top:{limit}:{timeRange}";
            var cached = await _cache.GetAsync<List<Deck>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved top rated decks from cache");
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<Deck>()
                    .Where(d => d.IsPublic == true)
                    .Order(d => d.CreatedAt, Ordering.Descending)
                    .Limit(limit)
                    .Get();

                var decks = response.Models;

                await _cache.SetAsync(cacheKey, decks,
                    TimeSpan.FromMinutes(_cacheSettings.DeckCacheMinutes));
                _logger.LogInformation("Retrieved and cached {Count} top rated decks", decks.Count);

                return decks;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving top-rated decks");
                throw;
            }
        }

        public async Task<string> CreateDeckAsync(Deck deck)
        {
            if (deck == null)
            {
                throw new ArgumentNullException(nameof(deck));
            }

            try
            {
                deck.Id = Guid.NewGuid();
                deck.CreatedAt = DateTime.UtcNow;
                deck.UpdatedAt = DateTime.UtcNow;

                var response = await _supabaseClient
                    .From<Deck>()
                    .Insert(deck);

                var createdDeck = response.Models.FirstOrDefault();
                if (createdDeck == null)
                {
                    throw new InvalidOperationException("No deck returned after insertion");
                }

                // Invalidate relevant cache entries
                await InvalidateDeckCacheAsync(createdDeck);
                _logger.LogInformation("Created new deck with ID {Id}", createdDeck.Id);

                return createdDeck.Id.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating deck");
                throw;
            }
        }

        public async Task UpdateDeckAsync(string id, Deck deck)
        {
            if (!Guid.TryParse(id, out var deckGuid))
            {
                throw new ArgumentException("Invalid deck ID format", nameof(id));
            }

            if (deck == null)
            {
                throw new ArgumentNullException(nameof(deck));
            }

            try
            {
                deck.UpdatedAt = DateTime.UtcNow;
                var response = await _supabaseClient
                    .From<Deck>()
                    .Where(d => d.Id == deckGuid)
                    .Update(deck);

                var updatedDeck = response.Models.FirstOrDefault();
                if (updatedDeck != null)
                {
                    // Invalidate relevant cache entries
                    await InvalidateDeckCacheAsync(updatedDeck);
                    _logger.LogInformation("Updated deck {Id}", id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating deck {Id}", id);
                throw;
            }
        }

        public async Task DeleteDeckAsync(string id)
        {
            if (!Guid.TryParse(id, out var deckGuid))
            {
                throw new ArgumentException("Invalid deck ID format", nameof(id));
            }

            try
            {
                // Get the deck first to know which cache keys to invalidate
                var deck = await GetDeckByIdAsync(id);
                if (deck != null)
                {
                    await _supabaseClient
                        .From<Deck>()
                        .Where(d => d.Id == deckGuid)
                        .Delete();

                    // Invalidate relevant cache entries
                    await InvalidateDeckCacheAsync(deck);
                    _logger.LogInformation("Deleted deck {Id}", id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting deck {Id}", id);
                throw;
            }
        }

        public async Task<bool> VoteDeckAsync(string id, string userId, bool isUpvote)
        {
            if (!Guid.TryParse(id, out var deckGuid))
            {
                throw new ArgumentException("Invalid deck ID format", nameof(id));
            }

            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            try
            {
                // Verify deck exists
                var deck = await GetDeckByIdAsync(id);
                if (deck == null)
                {
                    _logger.LogWarning("Deck {Id} not found", id);
                    return false;
                }

                // Check for an existing vote
                var existingVoteResponse = await _supabaseClient
                    .From<DeckVote>()
                    .Filter(v => v.DeckId, Operator.Equals, deckGuid)
                    .Filter(v => v.UserId, Operator.Equals, userGuid)
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
                    // Insert new vote
                    var vote = new DeckVote
                    {
                        Id = Guid.NewGuid(),
                        DeckId = deckGuid,
                        UserId = userGuid,
                        IsUpvote = isUpvote,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    await _supabaseClient
                        .From<DeckVote>()
                        .Insert(vote);
                }

                // Invalidate relevant cache entries since the vote count changed
                await InvalidateDeckCacheAsync(deck);
                _logger.LogInformation("Updated vote for deck {Id} by user {UserId}", id, userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error voting for deck {Id} by user {UserId}", id, userId);
                throw;
            }
        }

        private async Task InvalidateDeckCacheAsync(Deck deck)
        {
            var tasks = new List<Task>
            {
                // Invalidate specific deck cache
                _cache.RemoveAsync($"{CacheKeyPrefix}{deck.Id}"),
                
                // Invalidate user's deck list cache
                _cache.RemoveAsync($"{CacheKeyPrefix}user:{deck.UserId}"),
                
                // Invalidate general deck lists that might contain this deck
                _cache.RemoveAsync($"{CacheKeyPrefix}list:all:0"),
                _cache.RemoveAsync($"{CacheKeyPrefix}top:10:all"),
                
                // If the deck has a category, invalidate that category's cache
                deck.Category != null 
                    ? _cache.RemoveAsync($"{CacheKeyPrefix}list:{deck.Category}:0")
                    : Task.CompletedTask
            };

            await Task.WhenAll(tasks);
        }

        public async Task<List<Deck>> SearchDecksAsync(string query, string? category = null)
        {
            try
            {
                var baseQuery = _supabaseClient
                    .From<Deck>()
                    .Where(d => d.IsPublic == true);

                // Simple search using a case-insensitive "like" operator on the title
                var response = await baseQuery
                    .Filter(d => d.Title, Operator.ILike, $"%{query}%")
                    .Get();

                return response.Models;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching decks with query: {Query} and category: {Category}", query, category);
                throw;
            }
        }

        public async Task<List<Flashcard>> GetDeckFlashcardsAsync(string deckId)
        {
            if (!Guid.TryParse(deckId, out var deckGuid))
            {
                _logger.LogWarning("Invalid deck ID format for flashcards: {DeckId}", deckId);
                return new List<Flashcard>();
            }

            try
            {
                var response = await _supabaseClient
                    .From<Flashcard>()
                    .Where(f => f.DeckId == deckGuid)
                    .Get();

                return response.Models;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving flashcards for deck {DeckId}", deckId);
                throw;
            }
        }

        public async Task ReportDeckAsync(string id, string userId, string reason)
        {
            if (!Guid.TryParse(id, out var deckGuid))
            {
                throw new ArgumentException("Invalid deck ID format", nameof(id));
            }

            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            try
            {
                var report = new DeckReport
                {
                    Id = Guid.NewGuid(),
                    DeckId = deckGuid,
                    ReportedBy = userGuid,
                    Reason = reason,
                    Status = "pending",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _supabaseClient
                    .From<DeckReport>()
                    .Insert(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reporting deck with id {Id} by user {UserId}", id, userId);
                throw;
            }
        }

        public async Task<double> GetDeckRatingAsync(string deckId, string timeRange = "all")
        {
            if (!Guid.TryParse(deckId, out var deckGuid))
            {
                throw new ArgumentException("Invalid deck ID format", nameof(deckId));
            }

            try
            {
                var query = _supabaseClient
                    .From<DeckVote>()
                    .Filter(v => v.DeckId, Operator.Equals, deckGuid);

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
    }
}
