using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.Flashcard;
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
using AutoMapper;
using Microsoft.AspNetCore.Http;
using Lithuaningo.API.Settings;

namespace Lithuaningo.API.Services
{
    public class FlashcardService : IFlashcardService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "flashcard:";
        private readonly ILogger<FlashcardService> _logger;
        private readonly IMapper _mapper;
        private readonly IStorageService _storageService;
        private readonly IOptions<StorageSettings> _storageSettings;
        private readonly CacheInvalidator _cacheInvalidator;

        public FlashcardService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            IStorageService storageService,
            IOptions<StorageSettings> storageSettings,
            ILogger<FlashcardService> logger,
            IMapper mapper,
            CacheInvalidator cacheInvalidator)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _storageService = storageService ?? throw new ArgumentNullException(nameof(storageService));
            _storageSettings = storageSettings ?? throw new ArgumentNullException(nameof(storageSettings));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _cacheInvalidator = cacheInvalidator ?? throw new ArgumentNullException(nameof(cacheInvalidator));
        }

        public async Task<FlashcardResponse?> GetFlashcardByIdAsync(string id)
        {
            if (!Guid.TryParse(id, out var flashcardId))
            {
                throw new ArgumentException("Invalid flashcard ID format", nameof(id));
            }

            var cacheKey = $"{CacheKeyPrefix}{flashcardId}";
            var cached = await _cache.GetAsync<FlashcardResponse>(cacheKey);

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
                    var flashcardResponse = _mapper.Map<FlashcardResponse>(flashcard);
                    await _cache.SetAsync(cacheKey, flashcardResponse,
                        TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                    _logger.LogInformation("Retrieved and cached flashcard {Id}", id);
                    return flashcardResponse;
                }

                _logger.LogInformation("Flashcard {Id} not found", id);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving flashcard {Id}", id);
                throw;
            }
        }

        public async Task<string> CreateFlashcardAsync(CreateFlashcardRequest request)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            try
            {
                var flashcard = _mapper.Map<Flashcard>(request);
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

        public async Task<FlashcardResponse> UpdateFlashcardAsync(string id, UpdateFlashcardRequest request)
        {
            if (!Guid.TryParse(id, out var flashcardId))
            {
                throw new ArgumentException("Invalid flashcard ID format", nameof(id));
            }

            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            try
            {
                var existingFlashcard = await _supabaseClient
                    .From<Flashcard>()
                    .Where(f => f.Id == flashcardId)
                    .Get();

                var flashcard = existingFlashcard.Models.FirstOrDefault();
                if (flashcard == null)
                {
                    throw new ArgumentException("Flashcard not found", nameof(id));
                }

                _mapper.Map(request, flashcard);
                flashcard.UpdatedAt = DateTime.UtcNow;

                var response = await _supabaseClient
                    .From<Flashcard>()
                    .Where(f => f.Id == flashcardId)
                    .Update(flashcard);

                var updatedFlashcard = response.Models.First();
                var flashcardResponse = _mapper.Map<FlashcardResponse>(updatedFlashcard);

                // Invalidate relevant cache entries
                await InvalidateFlashcardCacheAsync(updatedFlashcard);
                _logger.LogInformation("Updated flashcard {Id}", id);

                return flashcardResponse;
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
                var flashcard = await _supabaseClient
                    .From<Flashcard>()
                    .Where(f => f.Id == flashcardId)
                    .Single();

                if (flashcard != null)
                {
                    // Delete the flashcard from the database
                    await _supabaseClient
                        .From<Flashcard>()
                        .Where(f => f.Id == flashcardId)
                        .Delete();

                    // Delete associated files from storage
                    var deleteFileTasks = new List<Task>();
                    
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
                    
                    // Wait for all file deletions to complete
                    await Task.WhenAll(deleteFileTasks);

                    // Invalidate cache entries
                    await _cacheInvalidator.InvalidateFlashcardAsync(flashcard.Id.ToString());

                    _logger.LogInformation("Deleted flashcard {Id} with associated files", id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting flashcard {Id}", id);
                throw;
            }
        }

        public async Task<List<FlashcardResponse>> GetRandomFlashcardsAsync(int limit = 10)
        {
            try
            {
                var response = await _supabaseClient
                    .From<Flashcard>()
                    .Select("*")
                    .Limit(limit)
                    .Get();

                var flashcards = response.Models;
                return _mapper.Map<List<FlashcardResponse>>(flashcards);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving random flashcards");
                throw;
            }
        }

        public async Task<List<FlashcardResponse>> SearchFlashcardsAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return new List<FlashcardResponse>();
            }

            try
            {
                var response = await _supabaseClient
                    .From<Flashcard>()
                    .Filter(f => f.FrontWord, Operator.ILike, $"%{query}%")
                    .Filter(f => f.BackWord, Operator.ILike, $"%{query}%")
                    .Get();

                var flashcards = response.Models;
                return _mapper.Map<List<FlashcardResponse>>(flashcards);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching flashcards with query: {Query}", query);
                throw;
            }
        }

        private async Task InvalidateFlashcardCacheAsync(Flashcard flashcard)
        {
            await _cacheInvalidator.InvalidateFlashcardAsync(flashcard.Id.ToString());
        }

        public async Task<string> UploadFlashcardFileAsync(IFormFile file)
        {
            if (file == null)
            {
                throw new ArgumentNullException(nameof(file));
            }

            try
            {
                var subfolder = file.ContentType.StartsWith("audio/")
                    ? _storageSettings.Value.Paths.Audio
                    : file.ContentType.StartsWith("image/")
                        ? _storageSettings.Value.Paths.Images
                        : _storageSettings.Value.Paths.Other;

                var url = await _storageService.UploadFileAsync(
                    file,
                    _storageSettings.Value.Paths.Flashcards,
                    subfolder
                );

                return url;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading flashcard file");
                throw;
            }
        }
    }
}
