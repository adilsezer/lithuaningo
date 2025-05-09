using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;
using AutoMapper;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.AI;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Stats;
using Lithuaningo.API.Services.Supabase;
using Lithuaningo.API.Utilities;
using Supabase;
using static Supabase.Postgrest.Constants;

namespace Lithuaningo.API.Services.Flashcards
{
    /// <summary>
    /// Service for managing flashcards, including retrieval, generation, and media attachment
    /// </summary>
    public class FlashcardService : IFlashcardService
    {
        #region Fields

        private readonly ILogger<FlashcardService> _logger;
        private readonly IAIService _aiService;
        private readonly ISupabaseService _supabaseService;
        private readonly IUserFlashcardStatService _userFlashcardStatService;
        private readonly IMapper _mapper;
        private readonly Random _random;
        private readonly ICacheService _cache;
        private readonly ICacheSettingsService _cacheSettingsService;
        private readonly CacheInvalidator _cacheInvalidator;
        private const string CacheKeyPrefix = "flashcard:";
        private const double ReviewFlashcardsRatio = 0.3; // 30% review cards, 70% new cards

        #endregion

        #region Constructor

        public FlashcardService(
            IAIService aiService,
            ISupabaseService supabaseService,
            IUserFlashcardStatService userFlashcardStatService,
            IMapper mapper,
            ILogger<FlashcardService> logger,
            ICacheService cache,
            ICacheSettingsService cacheSettingsService,
            CacheInvalidator cacheInvalidator,
            Random random)
        {
            _aiService = aiService ?? throw new ArgumentNullException(nameof(aiService));
            _supabaseService = supabaseService ?? throw new ArgumentNullException(nameof(supabaseService));
            _userFlashcardStatService = userFlashcardStatService ?? throw new ArgumentNullException(nameof(userFlashcardStatService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _cacheSettingsService = cacheSettingsService ?? throw new ArgumentNullException(nameof(cacheSettingsService));
            _cacheInvalidator = cacheInvalidator ?? throw new ArgumentNullException(nameof(cacheInvalidator));
            _random = random ?? throw new ArgumentNullException(nameof(random));
        }

        #endregion

        #region Public API Methods

        /// <summary>
        /// Retrieves a specific flashcard by its ID
        /// </summary>
        /// <param name="flashcardId">The ID of the flashcard to retrieve</param>
        /// <returns>The flashcard model if found, otherwise throws an exception</returns>
        public async Task<Flashcard> GetFlashcardByIdAsync(Guid flashcardId)
        {
            var cacheKey = $"{CacheKeyPrefix}id:{flashcardId}";

            // Try to get from cache first
            var flashcard = await _cache.GetAsync<Flashcard>(cacheKey);
            if (flashcard != null)
            {
                _logger.LogInformation("Retrieved flashcards from cache");
                return flashcard;
            }

            // Fetch from database
            var result = await _supabaseService.Client
                .From<Flashcard>()
                .Filter("id", Operator.Equals, flashcardId.ToString())
                .Get();

            flashcard = result.Models?.FirstOrDefault();
            if (flashcard == null)
            {
                throw new InvalidOperationException($"Flashcard with ID {flashcardId} not found");
            }

            // Cache the result
            await CacheFlashcardAsync(flashcard);
            return flashcard;
        }

        /// <summary>
        /// Retrieves flashcards based on specified criteria as model objects for internal use
        /// </summary>
        /// <param name="category">The flashcard category</param>
        /// <param name="difficulty">The difficulty level</param>
        /// <param name="limit">Maximum number of flashcards to retrieve</param>
        /// <returns>A collection of Flashcard model objects</returns>
        public async Task<IEnumerable<Flashcard>> RetrieveFlashcardModelsAsync(
            FlashcardCategory? category = null,
            DifficultyLevel? difficulty = null,
            int? limit = null)
        {
            try
            {
                // Construct a unique cache key based on parameters
                string cacheKey = BuildCacheKey(category, difficulty, limit);

                // Try to get from cache first
                var cached = await _cache.GetAsync<List<Flashcard>>(cacheKey);
                if (cached != null)
                {
                    _logger.LogInformation("Retrieved flashcards from cache");
                    return cached;
                }

                // Use separate filter operations with dynamic casting to handle type conversion issues
                var client = _supabaseService.Client;
                var query = client.From<Flashcard>();

                // Apply filters
                if (category.HasValue && category.Value != FlashcardCategory.AllCategories)
                {
                    int categoryValue = (int)category.Value;
                    var categoryFilter = query.Filter("categories", Operator.Contains, new List<object> { categoryValue });
                    query = (dynamic)categoryFilter;
                }

                if (difficulty.HasValue)
                {
                    int difficultyValue = (int)difficulty.Value;
                    var difficultyFilter = query.Filter("difficulty", Operator.Equals, difficultyValue);
                    query = (dynamic)difficultyFilter;
                }

                if (limit.HasValue)
                {
                    var limitedQuery = query.Limit(limit.Value);
                    query = (dynamic)limitedQuery;
                }

                // Execute query
                var result = await query.Get();
                var flashcards = result.Models?.ToList() ?? new List<Flashcard>();

                // Cache the results
                var settings = await _cacheSettingsService.GetCacheSettingsAsync();
                await _cache.SetAsync(cacheKey, flashcards,
                    TimeSpan.FromMinutes(settings.FlashcardCacheMinutes));

                _logger.LogInformation("Cached flashcards");

                return flashcards;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving flashcards");
                throw;
            }
        }

        /// <summary>
        /// Gets flashcards for a category, generating new ones if needed, with spaced repetition for users
        /// </summary>
        /// <param name="request">The flashcard request details</param>
        /// <param name="userId">The ID of the user requesting flashcards</param>
        /// <returns>A list of flashcard DTOs</returns>
        public async Task<IEnumerable<FlashcardResponse>> GetUserLearningFlashcardsAsync(FlashcardRequest request, string userId)
        {
            ValidateInputs(request, userId);
            request.UserId = userId; // For backward compatibility

            try
            {
                _logger.LogInformation("Getting learning flashcards");

                // Get existing flashcards matching criteria directly
                var existingFlashcards = await RetrieveFlashcardModelsAsync(
                    category: request.PrimaryCategory,
                    difficulty: request.Difficulty);

                // If none exist, generate new ones
                if (!existingFlashcards.Any())
                {
                    _logger.LogInformation("No existing flashcards found. Generating new flashcards");
                    return await GenerateFlashcardsAsync(request);
                }

                // Get flashcards using spaced repetition logic
                return await GetFlashcardsWithSpacedRepetitionAsync(existingFlashcards.ToList(), request, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting learning flashcards");
                throw;
            }
        }

        /// <summary>
        /// Generates flashcards using AI based on provided parameters and saves them to the database
        /// </summary>
        /// <param name="request">Parameters for flashcard generation</param>
        /// <param name="contextSampleSize">Size of the sample of existing flashcards to use for context</param>
        /// <returns>A list of generated flashcard DTOs</returns>
        public async Task<IEnumerable<FlashcardResponse>> GenerateFlashcardsAsync(FlashcardRequest request, int contextSampleSize = 100)
        {
            ValidateInputs(request, request.UserId ?? string.Empty);

            try
            {
                int primaryCategoryValue = (int)request.PrimaryCategory;

                // Get existing flashcard data for context
                var existingFrontTexts = await GetExistingFrontTextsAsync(primaryCategoryValue, contextSampleSize);

                // Generate flashcards with retries if needed
                var flashcards = await GenerateUniqueFlashcardsAsync(request, existingFrontTexts);

                // Save and return the generated flashcards
                await SaveFlashcardsToSupabaseAsync(flashcards, request.UserId);
                return _mapper.Map<IEnumerable<FlashcardResponse>>(flashcards);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating flashcards");
                throw;
            }
        }

        /// <summary>
        /// Generates an image for a flashcard using AI and updates the flashcard's ImageUrl
        /// </summary>
        /// <param name="flashcardId">ID of the flashcard to generate an image for</param>
        /// <returns>The URL of the generated image</returns>
        public async Task<string> GenerateFlashcardImageAsync(Guid flashcardId)
        {
            try
            {
                var flashcard = await GetFlashcardByIdAsync(flashcardId);

                // Generate the image using the back text (English)
                var imageUrl = await _aiService.GenerateImageAsync(flashcard.BackText);

                // Update and save the flashcard
                flashcard.ImageUrl = imageUrl;
                await UpdateFlashcardAsync(flashcard);

                _logger.LogInformation("Generated and set image for flashcard");

                return imageUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating image for flashcard");
                throw;
            }
        }

        /// <summary>
        /// Generates audio for a flashcard using text-to-speech and updates the flashcard's AudioUrl
        /// </summary>
        /// <param name="flashcardId">ID of the flashcard to generate audio for</param>
        /// <returns>The URL of the generated audio file</returns>
        public async Task<string> GenerateFlashcardAudioAsync(Guid flashcardId)
        {
            try
            {
                var flashcard = await GetFlashcardByIdAsync(flashcardId);

                // Validate the flashcard has necessary fields
                if (string.IsNullOrEmpty(flashcard.FrontText) || string.IsNullOrEmpty(flashcard.ExampleSentence))
                {
                    throw new InvalidOperationException($"Flashcard with ID {flashcardId} has no front text or example sentence");
                }

                // Generate the audio
                var audioUrl = await _aiService.GenerateAudioAsync(
                    flashcard.FrontText,
                    flashcard.ExampleSentence);

                // Update and save the flashcard
                flashcard.AudioUrl = audioUrl;
                await UpdateFlashcardAsync(flashcard);

                _logger.LogInformation("Generated and set audio for flashcard");

                return audioUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating audio for flashcard");
                throw;
            }
        }

        #endregion

        #region Private Helper Methods - Data Retrieval

        private async Task<List<Flashcard>> GetFlashcardsForReviewAsync(
            List<Flashcard> allFlashcards,
            string userId,
            int reviewCount)
        {

            // Get flashcard IDs that need review based on mastery level
            var flashcardsToReview = await _userFlashcardStatService.GetFlashcardsDueForReviewAsync(
                userId, allFlashcards.Select(f => f.Id), reviewCount);

            var reviewIds = flashcardsToReview.Select(f => f.FlashcardId).ToHashSet();

            // Get the actual flashcard objects
            var reviewFlashcards = allFlashcards
                .Where(f => reviewIds.Contains(f.Id))
                .ToList();

            _logger.LogInformation("Selected flashcards for review based on mastery level");

            return reviewFlashcards;
        }

        private async Task<IEnumerable<FlashcardResponse>> GetFlashcardsWithSpacedRepetitionAsync(
            List<Flashcard> allFlashcards, FlashcardRequest request, string userId)
        {
            // Get all previously shown flashcard IDs
            var shownFlashcardIds = await _userFlashcardStatService.GetShownFlashcardIdsAsync(userId);

            // STEP 1: Get flashcards for review based on mastery level
            int reviewCount = (int)Math.Ceiling(request.Count * ReviewFlashcardsRatio);
            var reviewFlashcards = await GetFlashcardsForReviewAsync(allFlashcards, userId, reviewCount);

            // STEP 2: Fill the rest with new flashcards the user hasn't seen
            int newCardsNeeded = request.Count - reviewFlashcards.Count;
            var newFlashcards = allFlashcards
                .Where(f => !shownFlashcardIds.Contains(f.Id))
                .OrderBy(_ => _random.Next())
                .Take(newCardsNeeded)
                .ToList();

            _logger.LogInformation("Selected new flashcards the user hasn't seen before");

            // STEP 3: Combine the review and new flashcards
            var selectedFlashcards = reviewFlashcards.Concat(newFlashcards).ToList();

            // STEP 4: If we still need more flashcards, generate them with AI
            int remainingCount = request.Count - selectedFlashcards.Count;
            if (remainingCount > 0)
            {
                _logger.LogInformation("Not enough existing flashcards, generating new ones");

                // Create a copy of the request with adjusted count
                var generationRequest = new FlashcardRequest
                {
                    PrimaryCategory = request.PrimaryCategory,
                    Count = remainingCount,
                    UserId = userId,
                    Difficulty = request.Difficulty
                };

                // Generate new flashcards
                var newFlashcardResponses = await GenerateFlashcardsAsync(generationRequest);

                // Map existing flashcards to response DTOs
                var selectedResponses = _mapper.Map<IEnumerable<FlashcardResponse>>(selectedFlashcards);

                // Combine both sets
                return selectedResponses.Concat(newFlashcardResponses);
            }

            // STEP 5: Shuffle and return the final selection
            return _mapper.Map<IEnumerable<FlashcardResponse>>(
                selectedFlashcards.OrderBy(_ => _random.Next()).ToList());
        }

        private async Task<List<string>> GetExistingFrontTextsAsync(
            int categoryValue,
            int sampleSize = 100)
        {
            var cacheKey = $"{CacheKeyPrefix}front-texts:category:{categoryValue}:sample:{sampleSize}";

            // Try to get from cache first
            var cached = await _cache.GetAsync<List<string>>(cacheKey);
            if (cached != null)
            {
                _logger.LogInformation("Retrieved front texts from cache");
                return cached;
            }

            var frontTexts = new List<string>();

            // First, count the total number of available flashcards (needed for random offset)
            var totalFlashcards = await _supabaseService.Client
                .From<Flashcard>()
                .Count(CountType.Exact);

            // Calculate a safe maximum offset value - ensure we don't exceed available rows
            int maxOffset = Math.Max(0, totalFlashcards - sampleSize);

            // Use a random offset that won't exceed the available data
            int offset = maxOffset > 0 ? _random.Next(0, maxOffset) : 0;

            _logger.LogInformation("Using random offset for flashcard selection");

            // First, get the specific category flashcards
            var categoryFlashcards = await _supabaseService.Client
                .From<Flashcard>()
                .Select("front_text")
                .Filter(f => f.Categories, Operator.Contains, new List<object> { categoryValue })
                .Get();

            // Process front texts
            if (categoryFlashcards.Models != null)
            {
                frontTexts.AddRange(categoryFlashcards.Models.Select(f => f.FrontText));
                _logger.LogInformation("Retrieved flashcards for category");
            }

            // Get random sample of front texts from all flashcards using the offset
            // Only fetch what we need if we don't already have enough front texts
            if (frontTexts.Count < sampleSize)
            {
                var remainingSampleSize = sampleSize - frontTexts.Count;

                if (remainingSampleSize > 0)
                {
                    var randomSample = await _supabaseService.Client
                        .From<Flashcard>()
                        .Select("front_text")
                        .Limit(remainingSampleSize)
                        .Offset(offset)
                        .Get();

                    if (randomSample.Models != null)
                    {
                        // Add the random sample front texts
                        frontTexts.AddRange(randomSample.Models.Select(f => f.FrontText));
                    }
                }
            }

            // Remove duplicates and take only what we need
            frontTexts = frontTexts.Distinct().Take(sampleSize).ToList();

            // Cache the result
            var settings = await _cacheSettingsService.GetCacheSettingsAsync();
            await _cache.SetAsync(cacheKey, frontTexts,
                TimeSpan.FromMinutes(settings.FlashcardCacheMinutes));

            _logger.LogInformation("Cached random front texts");

            return frontTexts;
        }

        #endregion

        #region Private Helper Methods - Flashcard Generation

        private async Task<List<Flashcard>> GenerateUniqueFlashcardsAsync(
            FlashcardRequest request,
            List<string> existingFrontTexts)
        {
            const int maxAttempts = 3;
            int attemptCount = 0;
            List<Flashcard> flashcards = new List<Flashcard>();

            // Create a case-insensitive HashSet of front texts to efficiently check for duplicates
            var frontTextLookup = new HashSet<string>(
                existingFrontTexts.Select(text => text.ToLowerInvariant()),
                StringComparer.OrdinalIgnoreCase);

            // Create request
            var currentRequest = new FlashcardRequest
            {
                PrimaryCategory = request.PrimaryCategory,
                Count = request.Count * 2,
                UserId = request.UserId,
                Difficulty = request.Difficulty
            };

            // Retry generation until we have enough flashcards or reach max attempts
            while (flashcards.Count < request.Count && attemptCount < maxAttempts)
            {
                attemptCount++;

                // Log generation details
                if (attemptCount == 1)
                {
                    _logger.LogInformation("Generating flashcards");
                }
                else
                {
                    _logger.LogInformation("Retrying flashcard generation");
                }

                // Generate flashcards
                var newFlashcards = await _aiService.GenerateFlashcardsAsync(currentRequest, existingFrontTexts);

                // Filter out duplicates based on front text only
                var uniqueNewFlashcards = newFlashcards
                    .Where(f => !frontTextLookup.Contains(f.FrontText.ToLowerInvariant()))
                    .ToList();

                // Add unique flashcards to our collection
                flashcards.AddRange(uniqueNewFlashcards);

                // Update tracking to avoid duplicates in next attempt
                foreach (var card in uniqueNewFlashcards)
                {
                    frontTextLookup.Add(card.FrontText.ToLowerInvariant());
                }

                // If we got enough flashcards, break early
                if (flashcards.Count >= request.Count)
                {
                    break;
                }
            }

            // Log the final result if we couldn't generate enough
            if (flashcards.Count < request.Count)
            {
                _logger.LogWarning("Could not generate enough flashcards");
            }

            // Trim if we got more than requested
            if (flashcards.Count > request.Count)
            {
                flashcards = flashcards.Take(request.Count).ToList();
            }

            return flashcards;
        }

        #endregion

        #region Private Helper Methods - Database Operations

        private async Task UpdateFlashcardAsync(Flashcard flashcard)
        {
            await _supabaseService.Client
                .From<Flashcard>()
                .Update(flashcard);

            // Invalidate caches
            await InvalidateFlashcardCachesAsync(flashcard);
        }

        private async Task InvalidateFlashcardCachesAsync(Flashcard flashcard)
        {
            // Invalidate the specific flashcard cache
            await _cacheInvalidator.InvalidateFlashcardAsync(flashcard.Id.ToString());

            // Also invalidate category-based caches
            if (flashcard.Categories?.Count > 0)
            {
                foreach (var category in flashcard.Categories)
                {
                    await _cacheInvalidator.InvalidateAllFlashcardCachesForCategoryAsync(category);
                }
            }
        }

        private async Task SaveFlashcardsToSupabaseAsync(List<Flashcard> flashcards, string? userId = null)
        {
            try
            {
                var result = await _supabaseService.Client
                    .From<Flashcard>()
                    .Insert(flashcards);

                int insertedCount = result.Models?.Count ?? 0;
                _logger.LogInformation("Successfully saved flashcards to Supabase");

                // Invalidate relevant caches
                await InvalidateCategoryCachesForFlashcardsAsync(result.Models);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving flashcards to Supabase");
                throw;
            }
        }

        private async Task InvalidateCategoryCachesForFlashcardsAsync(IEnumerable<Flashcard>? flashcards)
        {
            if (flashcards == null)
            {
                return;
            }

            // Use a HashSet to track unique categories
            var uniqueCategories = new HashSet<int>();

            // Collect all affected categories
            foreach (var flashcard in flashcards)
            {
                if (flashcard.Categories != null)
                {
                    foreach (var category in flashcard.Categories)
                    {
                        uniqueCategories.Add(category);
                    }
                }
            }

            // Invalidate caches for each category
            foreach (var category in uniqueCategories)
            {
                await _cacheInvalidator.InvalidateAllFlashcardCachesForCategoryAsync(category);
            }

            if (uniqueCategories.Count > 0)
            {
                _logger.LogInformation("Invalidated flashcard caches for categories");
            }
        }

        private async Task CacheFlashcardAsync(Flashcard flashcard)
        {
            var cacheKey = $"{CacheKeyPrefix}id:{flashcard.Id}";
            var settings = await _cacheSettingsService.GetCacheSettingsAsync();
            await _cache.SetAsync(cacheKey, flashcard, TimeSpan.FromMinutes(settings.FlashcardCacheMinutes));
            _logger.LogInformation("Cached flashcard");
        }

        #endregion

        #region Private Helper Methods - Utilities

        private static void ValidateInputs(FlashcardRequest request, string userId)
        {
            ArgumentNullException.ThrowIfNull(request);

            if (string.IsNullOrEmpty(userId))
            {
                throw new ArgumentNullException(nameof(userId));
            }
        }

        private static string BuildCacheKey(FlashcardCategory? category, DifficultyLevel? difficulty, int? limit)
        {
            var components = new List<string> { CacheKeyPrefix };

            if (category.HasValue && category.Value != FlashcardCategory.AllCategories)
            {
                components.Add($"category:{(int)category.Value}");
            }

            if (difficulty.HasValue)
            {
                components.Add($"difficulty:{(int)difficulty.Value}");
            }

            if (limit.HasValue)
            {
                components.Add($"limit:{limit.Value}");
            }

            return string.Join(":", components);
        }

        #endregion
    }
}
