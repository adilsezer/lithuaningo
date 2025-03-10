using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.Deck;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Interfaces;
using static Supabase.Postgrest.Constants;
using Supabase;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Caching.Distributed;

namespace Lithuaningo.API.Services
{
    public class DeckService : IDeckService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "deck:";
        private readonly ILogger<DeckService> _logger;
        private readonly IMapper _mapper;
        private readonly IStorageService _storageService;
        private readonly IOptions<StorageSettings> _storageSettings;
        private readonly IDeckVoteService _deckVoteService;
        private readonly CacheInvalidator _cacheInvalidator;

        public DeckService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<DeckService> logger,
            IMapper mapper,
            IStorageService storageService,
            IOptions<StorageSettings> storageSettings,
            IDeckVoteService deckVoteService,
            CacheInvalidator cacheInvalidator)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _storageService = storageService ?? throw new ArgumentNullException(nameof(storageService));
            _storageSettings = storageSettings ?? throw new ArgumentNullException(nameof(storageSettings));
            _deckVoteService = deckVoteService ?? throw new ArgumentNullException(nameof(deckVoteService));
            _cacheInvalidator = cacheInvalidator ?? throw new ArgumentNullException(nameof(cacheInvalidator));
        }

        public async Task<List<DeckResponse>> GetDecksAsync(string? category = null, int? limit = null)
        {
            var cacheKey = $"{CacheKeyPrefix}list:{category ?? "all"}:{limit ?? 0}";
            var cached = await _cache.GetAsync<List<DeckResponse>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved decks from cache with category: {Category} and limit: {Limit}", 
                    category, limit);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<Deck>()
                    .Filter("is_public", Operator.Equals, "true")
                    .Select("*")
                    .Order("created_at", Ordering.Descending)
                    .Get();

                var decks = response.Models;
                var deckResponses = _mapper.Map<List<DeckResponse>>(decks);

                if (!string.IsNullOrEmpty(category))
                {
                    deckResponses = deckResponses.Where(d => d.Category == category).ToList();
                }

                if (limit.HasValue)
                {
                    deckResponses = deckResponses.Take(limit.Value).ToList();
                }

                await _cache.SetAsync(cacheKey, deckResponses,
                    TimeSpan.FromMinutes(_cacheSettings.DeckCacheMinutes));
                _logger.LogInformation("Retrieved and cached {Count} decks with category: {Category} and limit: {Limit}",
                    decks.Count, category, limit);

                return deckResponses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving decks");
                throw;
            }
        }

        public async Task<DeckResponse?> GetDeckByIdAsync(string id)
        {
            if (!Guid.TryParse(id, out var deckGuid))
            {
                throw new ArgumentException("Invalid deck ID format", nameof(id));
            }

            var cacheKey = $"{CacheKeyPrefix}{deckGuid}";
            var cached = await _cache.GetAsync<DeckResponse>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved deck {Id} from cache", id);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<Deck>()
                    .Select("*")
                    .Where(d => d.Id == deckGuid)
                    .Get();

                var deck = response.Models.FirstOrDefault();
                if (deck != null)
                {
                    var deckResponse = _mapper.Map<DeckResponse>(deck);
                    
                    await _cache.SetAsync(cacheKey, deckResponse,
                        TimeSpan.FromMinutes(_cacheSettings.DeckCacheMinutes));
                    _logger.LogInformation("Retrieved and cached deck {Id}", id);
                    return deckResponse;
                }

                _logger.LogInformation("Deck {Id} not found", id);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving deck {Id}", id);
                throw;
            }
        }

        public async Task<List<DeckResponse>> GetUserDecksAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            var cacheKey = $"{CacheKeyPrefix}user:{userGuid}";
            var cached = await _cache.GetAsync<List<DeckResponse>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved user decks from cache for user {UserId}", userId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<Deck>()
                    .Select("*")
                    .Where(d => d.UserId == userGuid)
                    .Get();

                var decks = response.Models;
                var deckResponses = _mapper.Map<List<DeckResponse>>(decks);

                await _cache.SetAsync(cacheKey, deckResponses,
                    TimeSpan.FromMinutes(_cacheSettings.DeckCacheMinutes));
                _logger.LogInformation("Retrieved and cached {Count} decks for user {UserId}", 
                    decks.Count, userId);

                return deckResponses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving decks for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<DeckWithRatingResponse>> GetTopRatedDecksAsync(int limit = 10, string timeRange = "all")
        {
            var cacheKey = $"{CacheKeyPrefix}top:{limit}:{timeRange}";
            var cached = await _cache.GetAsync<List<DeckWithRatingResponse>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved top rated decks from cache");
                return cached;
            }

            try
            {
                // Get all public decks first
                var decksQuery = await _supabaseClient
                    .From<Deck>()
                    .Select("*")
                    .Where(d => d.IsPublic == true)
                    .Get();

                var decks = decksQuery.Models;

                // Get vote statistics for each deck using DeckVoteService
                var deckResponses = new List<DeckWithRatingResponse>();
                foreach (var deck in decks)
                {
                    var deckResponse = _mapper.Map<DeckWithRatingResponse>(deck);
                    
                    // Always get fresh vote data
                    var (upvotes, downvotes) = await _deckVoteService.GetDeckVoteCountsAsync(deck.Id);
                    var rating = await _deckVoteService.CalculateDeckRatingAsync(deck.Id);

                    deckResponse.TotalVotes = upvotes + downvotes;
                    deckResponse.UpvoteCount = upvotes;
                    deckResponse.Rating = rating;

                    _logger.LogInformation("Top deck {Id} has rating {Rating}, upvotes {Upvotes}, total {Total}", 
                        deck.Id, rating, upvotes, upvotes + downvotes);

                    deckResponses.Add(deckResponse);
                }

                // Sort and take the top rated decks
                var topDecks = deckResponses
                    .OrderByDescending(d => d.Rating)
                    .ThenByDescending(d => d.CreatedAt)
                    .Take(limit)
                    .ToList();

                // Use shorter cache time for top rated decks since they change frequently
                // 30 seconds is a good balance for most applications
                await _cache.SetAsync(cacheKey, topDecks, TimeSpan.FromSeconds(30));
                    
                _logger.LogInformation("Retrieved and cached {0} top rated decks", topDecks.Count);

                return topDecks;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving top-rated decks");
                throw;
            }
        }

        public async Task<DeckResponse> CreateDeckAsync(CreateDeckRequest request)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            try
            {
                var deck = _mapper.Map<Deck>(request);
                deck.Id = Guid.NewGuid();
                deck.CreatedAt = DateTime.UtcNow;
                deck.UpdatedAt = DateTime.UtcNow;

                var response = await _supabaseClient
                    .From<Deck>()
                    .Insert(deck);

                var createdDeck = response.Models.First();
                var deckResponse = _mapper.Map<DeckResponse>(createdDeck);

                // Invalidate relevant cache entries
                await InvalidateDeckCacheAsync(deckResponse);
                _logger.LogInformation("Created new deck with ID {Id}", createdDeck.Id);

                return deckResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating deck");
                throw;
            }
        }

        public async Task<DeckResponse> UpdateDeckAsync(string id, UpdateDeckRequest request)
        {
            if (!Guid.TryParse(id, out var deckGuid))
            {
                throw new ArgumentException("Invalid deck ID format", nameof(id));
            }

            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            try
            {
                var existingDeck = await _supabaseClient
                    .From<Deck>()
                    .Where(d => d.Id == deckGuid)
                    .Get();

                var deck = existingDeck.Models.FirstOrDefault();
                if (deck == null)
                {
                    throw new ArgumentException("Deck not found", nameof(id));
                }

                _mapper.Map(request, deck);
                deck.UpdatedAt = DateTime.UtcNow;

                var response = await _supabaseClient
                    .From<Deck>()
                    .Where(d => d.Id == deckGuid)
                    .Update(deck);

                var updatedDeck = response.Models.First();
                var deckResponse = _mapper.Map<DeckResponse>(updatedDeck);

                // Invalidate relevant cache entries
                await InvalidateDeckCacheAsync(deckResponse);
                _logger.LogInformation("Updated deck {Id}", id);

                return deckResponse;
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
                var deck = await _supabaseClient
                    .From<Deck>()
                    .Where(d => d.Id == deckGuid)
                    .Single();

                if (deck != null)
                {
                    // Get all flashcards associated with this deck to delete their files
                    var flashcards = await _supabaseClient
                        .From<Flashcard>()
                        .Where(f => f.DeckId == deckGuid)
                        .Get();

                    // Prepare file deletion tasks
                    var deleteFileTasks = new List<Task>();

                    // Delete deck image if exists
                    if (!string.IsNullOrEmpty(deck.ImageUrl))
                    {
                        _logger.LogInformation("Deleting deck image: {ImageUrl}", deck.ImageUrl);
                        deleteFileTasks.Add(_storageService.DeleteFileAsync(deck.ImageUrl));
                    }

                    // Delete all flashcard files
                    foreach (var flashcard in flashcards.Models)
                    {
                        if (!string.IsNullOrEmpty(flashcard.ImageUrl))
                        {
                            _logger.LogInformation("Deleting flashcard image: {ImageUrl}", flashcard.ImageUrl);
                            deleteFileTasks.Add(_storageService.DeleteFileAsync(flashcard.ImageUrl));
                        }

                        if (!string.IsNullOrEmpty(flashcard.AudioUrl))
                        {
                            _logger.LogInformation("Deleting flashcard audio: {AudioUrl}", flashcard.AudioUrl);
                            deleteFileTasks.Add(_storageService.DeleteFileAsync(flashcard.AudioUrl));
                        }
                    }

                    // Delete all flashcards in the deck
                    await _supabaseClient
                        .From<Flashcard>()
                        .Where(f => f.DeckId == deckGuid)
                        .Delete();

                    // Delete the deck
                    await _supabaseClient
                        .From<Deck>()
                        .Where(d => d.Id == deckGuid)
                        .Delete();

                    // Wait for all file deletions to complete
                    await Task.WhenAll(deleteFileTasks);

                    // Invalidate cache entries
                    var deckResponse = _mapper.Map<DeckResponse>(deck);
                    await InvalidateDeckCacheAsync(deckResponse);
                    
                    _logger.LogInformation("Deleted deck {Id} with all associated flashcards and files", id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting deck {Id}", id);
                throw;
            }
        }

        public async Task<List<DeckResponse>> SearchDecksAsync(string query, string? category = null)
        {
            try
            {
                var baseQuery = _supabaseClient
                    .From<Deck>()
                    .Where(d => d.IsPublic == true);

                // Simple search using a case-insensitive "like" operator on the title
                var response = await baseQuery
                    .Filter("title", Operator.ILike, $"%{query}%")
                    .Get();

                var decks = response.Models;
                var deckResponses = _mapper.Map<List<DeckResponse>>(decks);

                if (!string.IsNullOrEmpty(category))
                {
                    deckResponses = deckResponses.Where(d => d.Category == category).ToList();
                }

                return deckResponses;
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
                    UserId = userGuid,
                    Reason = reason,
                    Status = "pending",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _supabaseClient
                    .From<DeckReport>()
                    .Insert(report);

                _logger.LogInformation("Created report for deck {DeckId} by user {UserId}", id, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reporting deck with id {Id} by user {UserId}", id, userId);
                throw;
            }
        }

        public async Task<string> UploadDeckImageAsync(IFormFile file)
        {
            if (file == null)
            {
                _logger.LogError("[DeckService.UploadDeckImageAsync] File is null");
                throw new ArgumentNullException(nameof(file));
            }

            try
            {
                _logger.LogInformation(
                    "[DeckService.UploadDeckImageAsync] Processing file upload: {FileName}, Type: {ContentType}, Size: {Size}KB",
                    file.FileName,
                    file.ContentType,
                    file.Length / 1024
                );

                var url = await _storageService.UploadFileAsync(
                    file,
                    _storageSettings.Value.Paths.Decks,
                    _storageSettings.Value.Paths.Images
                );

                _logger.LogInformation(
                    "[DeckService.UploadDeckImageAsync] File uploaded successfully: {FileName}, URL: {Url}, Path: {Path}/{SubPath}",
                    file.FileName,
                    url,
                    _storageSettings.Value.Paths.Decks,
                    _storageSettings.Value.Paths.Images
                );

                return url;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "[DeckService.UploadDeckImageAsync] Error uploading file: {FileName}, Type: {ContentType}, Size: {Size}KB",
                    file.FileName,
                    file.ContentType,
                    file.Length / 1024
                );
                throw;
            }
        }

        /// <summary>
        /// Gets a specified number of random deck IDs
        /// </summary>
        /// <param name="limit">Maximum number of deck IDs to return</param>
        /// <returns>List of random deck IDs</returns>
        public async Task<List<string>> GetRandomDeckIdsAsync(int limit = 10)
        {
            try
            {
                _logger.LogInformation("Retrieving {Limit} random deck IDs", limit);

                // We can't use random() directly, so we'll get a larger sample and randomize in memory
                // This approach still limits the data transfer compared to the original implementation
                var maxSampleSize = Math.Min(limit * 3, 100); // Get more than we need but cap it
                
                var response = await _supabaseClient
                    .From<Models.Deck>()
                    .Where(d => d.IsPublic == true && d.FlashcardsCount > 0)
                    .Limit(maxSampleSize)
                    .Get();
                    
                // Randomize in memory and take the requested number
                // This is more efficient than fetching all decks
                var random = new Random();
                return response.Models
                    .OrderBy(x => random.Next())
                    .Take(Math.Min(limit, response.Models.Count))
                    .Select(d => d.Id.ToString())
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving random deck IDs");
                throw;
            }
        }

        private async Task InvalidateDeckCacheAsync(DeckResponse deck)
        {
            // Use the centralized CacheInvalidator instead of manual cache removal
            await _cacheInvalidator.InvalidateDeckAsync(deck.Id.ToString(), deck.UserId.ToString());
        }
    }
}
