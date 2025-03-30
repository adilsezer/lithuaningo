using Lithuaningo.API.Services.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http;
using Lithuaningo.API.Settings;
using Lithuaningo.API.DTOs.Flashcard;
using System.Text.Json.Serialization;
using AutoMapper;
using Lithuaningo.API.Models;
using static Supabase.Postgrest.Constants;

namespace Lithuaningo.API.Services
{
    public class FlashcardService : IFlashcardService
    {
        private readonly ILogger<FlashcardService> _logger;
        private readonly IStorageService _storageService;
        private readonly IOptions<StorageSettings> _storageSettings;
        private readonly IAIService _aiService;
        private readonly ISupabaseService _supabaseService;
        private readonly IMapper _mapper;
        private readonly Random _random;

        public FlashcardService(
            IStorageService storageService,
            IOptions<StorageSettings> storageSettings,
            IAIService aiService,
            ISupabaseService supabaseService,
            IMapper mapper,
            ILogger<FlashcardService> logger,
            Random random)
        {
            _storageService = storageService ?? throw new ArgumentNullException(nameof(storageService));
            _storageSettings = storageSettings ?? throw new ArgumentNullException(nameof(storageSettings));
            _aiService = aiService ?? throw new ArgumentNullException(nameof(aiService));
            _supabaseService = supabaseService ?? throw new ArgumentNullException(nameof(supabaseService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _random = random ?? throw new ArgumentNullException(nameof(random));
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
        
        /// <summary>
        /// Generates flashcards using AI based on provided parameters and saves them to the database
        /// </summary>
        /// <param name="request">Parameters for flashcard generation</param>
        /// <returns>A list of generated flashcards</returns>
        public async Task<IEnumerable<FlashcardResponse>> GenerateFlashcardsAsync(FlashcardRequest request)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            if (string.IsNullOrEmpty(request.UserId))
            {
                throw new ArgumentNullException(nameof(request.UserId), "UserId is required for flashcard generation");
            }

            try
            {
                // Fetch only the front words we need for comparison
                var existingWords = await _supabaseService.Client
                    .From<Flashcard>()
                    .Select("front_word")
                    .Where(f => f.Topic == request.Topic)
                    .Get();

                // Create HashSet for O(1) lookups and case-insensitive comparison
                var existingWordSet = new HashSet<string>(
                    existingWords.Models.Select(f => f.FrontWord),
                    StringComparer.OrdinalIgnoreCase
                );

                // Generate flashcards with randomization
                var flashcards = await GenerateUniqueFlashcardsAsync(
                    request.Topic,
                    request.Count,
                    request.UserId,
                    existingWordSet,
                    request.Difficulty
                );

                // Save the generated flashcards to Supabase
                await SaveFlashcardsToSupabaseAsync(flashcards);

                return flashcards;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating flashcards for topic {Topic}", request.Topic);
                throw;
            }
        }

        private async Task<List<FlashcardResponse>> GenerateUniqueFlashcardsAsync(
            string topic,
            int count,
            string userId,
            HashSet<string> existingWords,
            DifficultyLevel difficulty = DifficultyLevel.Basic)
        {
            var flashcards = new List<FlashcardResponse>(count); // Pre-allocate capacity
            var maxAttempts = 3;
            var currentAttempt = 0;

            while (flashcards.Count < count && currentAttempt < maxAttempts)
            {
                currentAttempt++;
                var remainingCount = count - flashcards.Count;
                var requestCount = Math.Min(remainingCount + 2, 10); // Request a few extra to account for duplicates

                // Get a random subset of existing words to avoid duplicates
                var randomExistingWords = existingWords
                    .OrderBy(x => _random.Next())
                    .Take(100)
                    .ToList();

                var aiFlashcards = await _aiService.GenerateFlashcardsAsync(new FlashcardRequest
                {
                    Topic = topic,
                    Count = requestCount,
                    UserId = userId,
                    Difficulty = difficulty
                }, randomExistingWords);

                // Filter and add unique flashcards in a single pass
                foreach (var flashcard in aiFlashcards)
                {
                    if (flashcards.Count >= count) break;

                    if (!existingWords.Contains(flashcard.FrontWord))
                    {
                        flashcards.Add(flashcard);
                        existingWords.Add(flashcard.FrontWord);
                    }
                }
            }

            return flashcards;
        }

        /// <summary>
        /// Saves the generated flashcards to Supabase
        /// </summary>
        private async Task SaveFlashcardsToSupabaseAsync(List<FlashcardResponse> flashcards)
        {
            try
            {
                var flashcardModels = _mapper.Map<List<Flashcard>>(flashcards);

                // Set additional fields that aren't in the DTO
                foreach (var model in flashcardModels)
                {
                    model.ShownToUsers = new List<string>();
                    // Ensure difficulty level is preserved from the response
                    // Let the database handle CreatedAt with its triggers
                }

                var result = await _supabaseService.Client
                    .From<Flashcard>()
                    .Insert(flashcardModels);

                if (result.Models == null || result.Models.Count != flashcardModels.Count)
                {
                    throw new InvalidOperationException("Failed to save all flashcards to the database");
                }

                _logger.LogInformation("Successfully saved {Count} flashcards to Supabase", flashcardModels.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving flashcards to Supabase");
                throw;
            }
        }

        /// <summary>
        /// Gets flashcards for a topic, generating new ones if needed
        /// </summary>
        /// <param name="topic">The topic to get flashcards for</param>
        /// <param name="userId">The ID of the user requesting flashcards</param>
        /// <param name="count">Number of flashcards to return (default: 10)</param>
        /// <param name="difficulty">The difficulty level of flashcards (default: Basic)</param>
        /// <returns>A list of flashcards</returns>
        public async Task<IEnumerable<FlashcardResponse>> GetFlashcardsAsync(string topic, string userId, int count = 10, DifficultyLevel difficulty = DifficultyLevel.Basic)
        {
            try
            {
                // Get flashcards that haven't been shown to the user
                // Cast the enum to its integer value for Supabase query
                int difficultyValue = (int)difficulty;
                
                var existingFlashcards = await _supabaseService.Client
                    .From<Flashcard>()
                    .Where(f => f.Topic == topic)
                    .Filter(f => f.Difficulty, Operator.Equals, difficultyValue)
                    .Not(f => f.ShownToUsers, Operator.Contains, new List<object> { userId })
                    .Get();

                var availableFlashcards = existingFlashcards.Models?.Count ?? 0;

                // If we have enough flashcards, return them
                if (availableFlashcards >= count && existingFlashcards.Models != null)
                {
                    _logger.LogInformation("Returning {Count} existing flashcards for topic '{Topic}' with difficulty '{Difficulty}'", 
                        count, topic, difficulty);
                    var flashcards = existingFlashcards.Models.Take(count).ToList();
                    
                    // Mark flashcards as shown to the user
                    await MarkFlashcardsAsShownAsync(flashcards, userId);
                    
                    return _mapper.Map<IEnumerable<FlashcardResponse>>(flashcards);
                }

                // Calculate how many new flashcards we need
                var neededCount = count - availableFlashcards;
                _logger.LogInformation("Generating {Count} new flashcards for topic '{Topic}' with difficulty '{Difficulty}'", 
                    neededCount, topic, difficulty);

                // Generate new flashcards
                var newFlashcards = await GenerateFlashcardsAsync(new FlashcardRequest
                {
                    Topic = topic,
                    Count = neededCount,
                    UserId = userId,
                    Difficulty = difficulty
                });

                // Combine existing and new flashcards
                var allFlashcards = new List<FlashcardResponse>();
                
                if (existingFlashcards.Models != null)
                {
                    allFlashcards.AddRange(_mapper.Map<IEnumerable<FlashcardResponse>>(
                        existingFlashcards.Models
                    ));
                }
                
                allFlashcards.AddRange(newFlashcards);

                var result = allFlashcards.Take(count).ToList();

                // Mark all returned flashcards as shown to the user
                var flashcardModels = _mapper.Map<List<Flashcard>>(result);
                await MarkFlashcardsAsShownAsync(flashcardModels, userId);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting flashcards for topic '{Topic}' with difficulty '{Difficulty}'", topic, difficulty);
                throw;
            }
        }

        /// <summary>
        /// Marks multiple flashcards as shown to a user
        /// </summary>
        /// <param name="flashcards">The flashcards to mark as shown</param>
        /// <param name="userId">The ID of the user who has seen the flashcards</param>
        private async Task MarkFlashcardsAsShownAsync(List<Flashcard> flashcards, string userId)
        {
            try
            {
                foreach (var flashcard in flashcards)
                {
                    if (!flashcard.ShownToUsers.Contains(userId))
                    {
                        flashcard.ShownToUsers.Add(userId);
                    }
                }

                // Update all flashcards in a single batch
                var result = await _supabaseService.Client
                    .From<Flashcard>()
                    .Upsert(flashcards);

                if (result.Models == null || result.Models.Count != flashcards.Count)
                {
                    _logger.LogWarning("Failed to update ShownToUsers for some flashcards");
                }
                else
                {
                    _logger.LogInformation("Successfully marked {Count} flashcards as shown to user {UserId}", 
                        flashcards.Count, userId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking flashcards as shown to user {UserId}", userId);
                throw;
            }
        }
    }   
}
