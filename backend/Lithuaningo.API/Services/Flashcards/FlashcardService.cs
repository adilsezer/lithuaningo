using AutoMapper;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.AI;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Challenges;
using Lithuaningo.API.Services.Stats;
using Lithuaningo.API.Services.Supabase;
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
        private readonly IChallengeService _challengeService;

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
            Random random,
            IChallengeService challengeService)
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
            _challengeService = challengeService ?? throw new ArgumentNullException(nameof(challengeService));
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
        /// <param name="isVerified">Filter by verification status</param>
        /// <returns>A collection of Flashcard model objects</returns>
        public async Task<IEnumerable<Flashcard>> RetrieveFlashcardModelsAsync(
            FlashcardCategory? category = null,
            DifficultyLevel? difficulty = null,
            int? limit = null,
            bool? isVerified = null)
        {
            try
            {
                // Construct a unique cache key based on parameters
                string cacheKey = BuildCacheKey(category, difficulty, limit, isVerified);

                // Try to get from cache first
                var cached = await _cache.GetAsync<List<Flashcard>>(cacheKey);
                if (cached != null)
                {
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

                // Add filter for verification status
                if (isVerified.HasValue)
                {
                    // Pass boolean value as lowercase string for Supabase filter
                    var verifiedFilter = query.Filter("is_verified", Operator.Equals, isVerified.Value.ToString().ToUpper());
                    query = (dynamic)verifiedFilter;
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
                var expiration = TimeSpan.FromMinutes(settings.FlashcardCacheMinutes);
                await _cache.SetAsync(cacheKey, flashcards, expiration);

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
                // Get existing flashcards matching criteria directly
                var existingFlashcards = await RetrieveFlashcardModelsAsync(
                    category: request.PrimaryCategory,
                    difficulty: request.Difficulty);

                // If none exist, generate new ones
                if (!existingFlashcards.Any())
                {
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

                // Generate all unique flashcards (potentially more than request.Count due to overhead factor)
                var allGeneratedUniqueFlashcards = await GenerateUniqueFlashcardsAsync(request, existingFrontTexts);

                // The flashcards are already saved by GenerateUniqueFlashcardsAsync.
                // We just need to return the requested count.
                if (!allGeneratedUniqueFlashcards.Any())
                {
                    _logger.LogWarning("No unique flashcards were generated by AI for request");
                    return Enumerable.Empty<FlashcardResponse>(); // Return empty if nothing was generated
                }

                // Now, take only the number of flashcards originally requested to return to the client
                var flashcardsToReturn = allGeneratedUniqueFlashcards.Take(request.Count).ToList();

                return _mapper.Map<IEnumerable<FlashcardResponse>>(flashcardsToReturn);
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
                if (flashcard == null)
                {
                    _logger.LogWarning("Flashcard with ID {FlashcardId} not found for image generation.", flashcardId);
                    throw new InvalidOperationException($"Flashcard with ID {flashcardId} not found.");
                }

                // AIService now handles the upload and returns the URL directly.
                var imageUrl = await _aiService.GenerateImageAsync(flashcard.BackText, flashcard.ExampleSentenceTranslation, flashcard.Id.ToString());

                if (string.IsNullOrEmpty(imageUrl))
                {
                    // This case should ideally be caught within AIService if upload fails, 
                    // but an extra check here doesn't hurt.
                    _logger.LogError("AI service returned an empty or null URL for flashcard {FlashcardId}.", flashcardId);
                    throw new InvalidOperationException("AI service failed to return a valid image URL.");
                }

                flashcard.ImageUrl = imageUrl;
                await UpdateFlashcardAsync(flashcard); // This also handles cache invalidation

                _logger.LogInformation("Successfully generated and attached image for flashcard {FlashcardId}", flashcardId);
                return imageUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GenerateFlashcardImageAsync for flashcard {FlashcardId}", flashcardId);
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
                    flashcard.ExampleSentence,
                    flashcard.Id.ToString());

                // Update and save the flashcard
                flashcard.AudioUrl = audioUrl;
                await UpdateFlashcardAsync(flashcard);

                return audioUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating audio for flashcard");
                throw;
            }
        }

        #endregion

        #region Admin Methods

        public async Task<Flashcard> UpdateFlashcardAdminAsync(Guid flashcardId, UpdateFlashcardAdminRequest request)
        {
            try
            {
                var existingFlashcard = await GetFlashcardByIdAsync(flashcardId);
                if (existingFlashcard == null)
                {
                    throw new KeyNotFoundException($"Flashcard not found.");
                }

                // Use AutoMapper to map updates, ignoring ID and timestamps
                _mapper.Map(request, existingFlashcard);

                // Update the flashcard in Supabase
                await UpdateFlashcardAsync(existingFlashcard); // This also handles cache invalidation

                // Invalidate all flashcard list caches as admin updates can affect any list query.
                await _cacheInvalidator.InvalidateAllFlashcardListsAsync();

                // After updating the flashcard, clear its old challenges and generate new ones based on the updated content.
                _logger.LogInformation("Flashcard {FlashcardId} updated by admin. Regenerating associated challenge questions.", existingFlashcard.Id);
                try
                {
                    await _challengeService.ClearChallengesByFlashcardIdAsync(existingFlashcard.Id);
                    await _challengeService.GenerateAndSaveChallengesForFlashcardAsync(existingFlashcard);
                    _logger.LogInformation("Successfully regenerated challenge questions for updated flashcard {FlashcardId}.", existingFlashcard.Id);
                }
                catch (Exception challengeEx)
                {
                    _logger.LogError(challengeEx, "Error regenerating challenges for updated flashcard {FlashcardId} after admin update. The flashcard was updated, but challenges may be outdated or missing.", existingFlashcard.Id);
                    // Depending on requirements, you might want to re-throw or handle this more specifically.
                    // For now, the flashcard update itself is considered successful.
                }

                return existingFlashcard;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating flashcard (admin)");
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

            return reviewFlashcards;
        }

        private async Task<IEnumerable<FlashcardResponse>> GetFlashcardsWithSpacedRepetitionAsync(
            List<Flashcard> allFlashcards, FlashcardRequest request, string userId)
        {
            var shownFlashcardIds = await _userFlashcardStatService.GetAllUserInteractedFlashcardIdsAsync(userId);

            // STEP 1: Get flashcards for review
            int reviewCount = (int)Math.Ceiling(request.Count * ReviewFlashcardsRatio);
            var reviewFlashcards = await GetFlashcardsForReviewAsync(allFlashcards, userId, reviewCount);

            // STEP 2: Fill the rest with new flashcards the user hasn't seen from the existing pool
            int newCardsNeededFromPool = request.Count - reviewFlashcards.Count;
            var newFlashcardsFromPool = allFlashcards
                .Where(f => !shownFlashcardIds.Contains(f.Id) && !reviewFlashcards.Any(rf => rf.Id == f.Id))
                .OrderBy(_ => _random.Next())
                .Take(newCardsNeededFromPool > 0 ? newCardsNeededFromPool : 0) // Ensure Take count is not negative
                .ToList();

            // Combine current models from review and pool
            var flashcardModelsForSession = new List<Flashcard>();
            flashcardModelsForSession.AddRange(reviewFlashcards);
            flashcardModelsForSession.AddRange(newFlashcardsFromPool);

            // STEP 3: If we still need more flashcards, generate them with AI
            int remainingToAIMake = request.Count - flashcardModelsForSession.Count;
            if (remainingToAIMake > 0)
            {
                _logger.LogInformation("Need to generate {Count} flashcards with AI to meet request count.", remainingToAIMake);
                var generationRequest = new FlashcardRequest
                {
                    PrimaryCategory = request.PrimaryCategory,
                    Count = remainingToAIMake, // Request only the number actually needed for this step
                    UserId = userId,
                    Difficulty = request.Difficulty
                };

                // GenerateUniqueFlashcardsAsync returns models and queues initial challenge generation for these new AI cards
                // We need to provide some context of existing front texts to avoid duplicates from AI.
                var contextFrontTexts = allFlashcards.Select(f => f.FrontText)
                                       .Concat(flashcardModelsForSession.Select(f => f.FrontText))
                                       .Distinct()
                                       .ToList();

                var uniqueAiGeneratedFlashcards = await GenerateUniqueFlashcardsAsync(generationRequest, contextFrontTexts);
                flashcardModelsForSession.AddRange(uniqueAiGeneratedFlashcards.Take(remainingToAIMake)); // Add AI generated cards
            }

            // Ensure we don't exceed the originally requested count due to rounding or minimums
            var finalModelsForSession = flashcardModelsForSession.Take(request.Count).ToList();

            // STEP 4: Ensure all flashcards in the session have the correct number of challenge questions.
            // If not, existing challenges for that flashcard are cleared and new ones are regenerated.
            if (finalModelsForSession.Any())
            {
                const int RequiredChallengeQuestionCount = 4; // Define the required count
                var sessionFlashcardIds = finalModelsForSession.Select(f => f.Id).Distinct().ToList();

                // Fetch all challenge questions for the flashcards in the session to count them
                var allChallengesForSessionQuery = await _supabaseService.Client
                    .From<ChallengeQuestion>()
                    .Select("id, flashcard_id") // Select id for potential deletion and flashcard_id for grouping
                    .Filter("flashcard_id", Operator.In, sessionFlashcardIds.Select(id => id.ToString()).ToList())
                    .Get();

                var challengeCountsByFlashcardId = allChallengesForSessionQuery.Models
                    .Where(cq => cq.FlashcardId.HasValue) // Ensure FlashcardId is not null before grouping
                    .GroupBy(cq => cq.FlashcardId!.Value)
                    .ToDictionary(g => g.Key, g => g.Count());

                var flashcardsToRegenerateChallenges = new List<Flashcard>();

                foreach (var flashcard in finalModelsForSession)
                {
                    challengeCountsByFlashcardId.TryGetValue(flashcard.Id, out int currentChallengeCount);
                    // If currentChallengeCount is 0 (flashcard.Id not in dictionary) or not equal to required, regenerate.
                    if (currentChallengeCount != RequiredChallengeQuestionCount)
                    {
                        _logger.LogInformation(
                            "Flashcard ID {FlashcardId} has {CurrentCount} challenges, but requires {RequiredCount}. Queuing for regeneration.",
                            flashcard.Id, currentChallengeCount, RequiredChallengeQuestionCount);
                        flashcardsToRegenerateChallenges.Add(flashcard);
                    }
                }

                if (flashcardsToRegenerateChallenges.Any())
                {
                    _logger.LogInformation("Found {Count} flashcards in session needing challenge regeneration.", flashcardsToRegenerateChallenges.Count);
                    foreach (var flashcardForRegeneration in flashcardsToRegenerateChallenges)
                    {
                        _ = Task.Run(async () =>
                        {
                            try
                            {
                                _logger.LogInformation(
                                    "Asynchronously clearing and regenerating challenges for flashcard ID {FlashcardId}.",
                                    flashcardForRegeneration.Id);

                                // Assumes IChallengeService has ClearChallengesByFlashcardIdAsync
                                // This method needs to be implemented in ChallengeService to delete existing challenges.
                                await _challengeService.ClearChallengesByFlashcardIdAsync(flashcardForRegeneration.Id);
                                await _challengeService.GenerateAndSaveChallengesForFlashcardAsync(flashcardForRegeneration);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex,
                                    "Error during asynchronous challenge clearing/regeneration for flashcard ID {FlashcardId}.",
                                    flashcardForRegeneration.Id);
                            }
                        });
                    }
                }
            }

            // STEP 5: Shuffle the final list of models and map to DTOs for the response
            var shuffledFlashcards = finalModelsForSession.OrderBy(f => _random.Next()).ToList();
            _logger.LogInformation("Returning {Count} flashcards for user learning session.", shuffledFlashcards.Count);
            return _mapper.Map<IEnumerable<FlashcardResponse>>(shuffledFlashcards);
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

            return frontTexts;
        }

        #endregion

        #region Private Helper Methods - Flashcard Generation

        private async Task<List<Flashcard>> GenerateUniqueFlashcardsAsync(
            FlashcardRequest request,
            List<string> existingFrontTexts)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));

            // _aiService.GenerateFlashcardsAsync returns List<Flashcard> (model objects)
            var generatedFlashcards = await _aiService.GenerateFlashcardsAsync(request, existingFrontTexts);

            if (generatedFlashcards.Any())
            {
                // Save the newly generated flashcards to the database.
                // This is the single point where these AI-generated cards are saved.
                await SaveFlashcardsToSupabaseAsync(generatedFlashcards, request.UserId);

                // Asynchronously generate and save challenges for each new flashcard
                _ = Task.Run(async () =>
                {
                    foreach (var flashcard in generatedFlashcards)
                    {
                        try
                        {
                            await _challengeService.GenerateAndSaveChallengesForFlashcardAsync(flashcard);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error generating or saving challenges for flashcard ID {FlashcardId} asynchronously.", flashcard.Id);
                            // Optionally, implement a retry mechanism or dead-letter queue for failed challenge generations
                        }
                    }
                });

                // Asynchronously generate images and audio for each new flashcard (if requested)
                if (request.GenerateImages || request.GenerateAudio)
                {
                    _ = Task.Run(async () =>
                    {
                        foreach (var flashcard in generatedFlashcards)
                        {
                            if (request.GenerateImages)
                            {
                                try
                                {
                                    // Generate image for the flashcard
                                    await GenerateFlashcardImageAsync(flashcard.Id);
                                    _logger.LogInformation("Successfully generated image for flashcard ID {FlashcardId}", flashcard.Id);
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogError(ex, "Error generating image for flashcard ID {FlashcardId} asynchronously.", flashcard.Id);
                                }
                            }

                            if (request.GenerateAudio)
                            {
                                try
                                {
                                    // Generate audio for the flashcard
                                    await GenerateFlashcardAudioAsync(flashcard.Id);
                                    _logger.LogInformation("Successfully generated audio for flashcard ID {FlashcardId}", flashcard.Id);
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogError(ex, "Error generating audio for flashcard ID {FlashcardId} asynchronously.", flashcard.Id);
                                }
                            }
                        }
                    });
                }
            }

            return generatedFlashcards;
        }

        #endregion

        #region Private Helper Methods - Database Operations

        private async Task UpdateFlashcardAsync(Flashcard flashcard)
        {
            await _supabaseService.Client
                .From<Flashcard>()
                .Update(flashcard);

            // Directly invalidate all flashcard list caches
            await _cacheInvalidator.InvalidateAllFlashcardListsAsync();
        }

        private async Task SaveFlashcardsToSupabaseAsync(List<Flashcard> flashcards, string? userId = null)
        {
            if (flashcards == null || !flashcards.Any())
            {
                _logger.LogWarning("Attempted to save a null or empty list of flashcards.");
                return;
            }

            // Ensure CreatedAt and UpdatedAt are set
            var now = DateTime.UtcNow;
            foreach (var card in flashcards)
            {
                if (card.Id == Guid.Empty) card.Id = Guid.NewGuid();
            }

            try
            {
                var response = await _supabaseService.Client.From<Flashcard>().Insert(flashcards);
                _logger.LogInformation("{Count} flashcards saved to Supabase", flashcards.Count);

                // CRITICAL: Invalidate all flashcard caches after inserting new flashcards
                // This ensures that newly generated flashcards are immediately available for subsequent operations
                // and prevents duplicate generation due to stale cache data
                await _cacheInvalidator.InvalidateAllFlashcardListsAsync();

                // No need to trigger challenge generation here, it's handled in GenerateUniqueFlashcardsAsync
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving flashcards to Supabase.");
                throw; // Re-throw to indicate failure in the calling method
            }
        }

        private async Task CacheFlashcardAsync(Flashcard flashcard)
        {
            var cacheKey = $"{CacheKeyPrefix}id:{flashcard.Id}";
            var settings = await _cacheSettingsService.GetCacheSettingsAsync();
            await _cache.SetAsync(cacheKey, flashcard, TimeSpan.FromMinutes(settings.FlashcardCacheMinutes));
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

        private static string BuildCacheKey(FlashcardCategory? category, DifficultyLevel? difficulty, int? limit, bool? isVerified)
        {
            var components = new List<string> { CacheKeyPrefix.TrimEnd(':') }; // Start with prefix without trailing colon

            if (isVerified.HasValue)
            {
                components.Add(isVerified.Value ? "status:verified" : "status:unverified");
            }

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

            // Join non-empty components with a single colon
            return string.Join(":", components.Where(c => !string.IsNullOrEmpty(c)));
        }

        #endregion
    }
}
