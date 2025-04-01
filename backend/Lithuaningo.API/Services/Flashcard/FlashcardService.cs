using AutoMapper;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;
using static Supabase.Postgrest.Constants;

namespace Lithuaningo.API.Services
{
    public class FlashcardService : IFlashcardService
    {
        #region Fields

        private readonly ILogger<FlashcardService> _logger;
        private readonly IAIService _aiService;
        private readonly ISupabaseService _supabaseService;
        private readonly IUserFlashcardStatService _userFlashcardStatService;
        private readonly IMapper _mapper;
        private readonly Random _random;

        private const double ReviewFlashcardsRatio = 0.3; // 30% review cards, 70% new cards

        #endregion

        #region Constructor

        public FlashcardService(
            IAIService aiService,
            ISupabaseService supabaseService,
            IUserFlashcardStatService userFlashcardStatService,
            IMapper mapper,
            ILogger<FlashcardService> logger,
            Random random)
        {
            _aiService = aiService ?? throw new ArgumentNullException(nameof(aiService));
            _supabaseService = supabaseService ?? throw new ArgumentNullException(nameof(supabaseService));
            _userFlashcardStatService = userFlashcardStatService ?? throw new ArgumentNullException(nameof(userFlashcardStatService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _random = random ?? throw new ArgumentNullException(nameof(random));
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Gets flashcards for a category, generating new ones if needed
        /// </summary>
        /// <param name="request">The flashcard request details</param>
        /// <param name="userId">The ID of the user requesting flashcards</param>
        /// <returns>A list of flashcard DTOs</returns>
        public async Task<IEnumerable<FlashcardResponse>> GetFlashcardsAsync(FlashcardRequest request, string userId)
        {
            ValidateInputs(request, userId);
            request.UserId = userId; // For backward compatibility

            try
            {
                _logger.LogInformation(
                    "Getting flashcards for category '{Category}' with difficulty '{Difficulty}'{Hint}",
                    request.PrimaryCategory,
                    request.Difficulty,
                    FormatHintMessage(request.Hint));

                // Get all flashcards that match the request criteria
                var existingFlashcards = await GetExistingFlashcardsAsync(request);
                if (!existingFlashcards.Any())
                {
                    _logger.LogInformation("Generating {Count} new flashcards for category '{Category}' with difficulty '{Difficulty}'",
                        request.Count, request.PrimaryCategory, request.Difficulty);
                    return await GenerateFlashcardsAsync(request);
                }

                // Get flashcards using spaced repetition logic
                return await GetFlashcardsWithSpacedRepetitionAsync(existingFlashcards, request, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting flashcards for category '{Category}' with difficulty '{Difficulty}'",
                    request.PrimaryCategory, request.Difficulty);
                throw;
            }
        }

        /// <summary>
        /// Generates flashcards using AI based on provided parameters and saves them to the database
        /// </summary>
        /// <param name="request">Parameters for flashcard generation</param>
        /// <returns>A list of generated flashcard DTOs</returns>
        public async Task<IEnumerable<FlashcardResponse>> GenerateFlashcardsAsync(FlashcardRequest request)
        {
            ValidateInputs(request, request.UserId ?? string.Empty);

            try
            {
                int primaryCategoryValue = (int)request.PrimaryCategory;

                // Get existing words and track category-specific words
                var (existingWords, wordCategoryMap) = await GetExistingWordsAsync(primaryCategoryValue);

                // Select a random subset for AI context
                var randomWords = SelectRandomWords(existingWords, 100);

                LogGenerationDetails(request, randomWords.Count, existingWords.Count);

                // Generate and filter flashcards
                var flashcards = await GenerateUniqueFlashcardsAsync(request, randomWords, wordCategoryMap, primaryCategoryValue);

                // Save and return
                await SaveFlashcardsToSupabaseAsync(flashcards, request.UserId);
                return _mapper.Map<IEnumerable<FlashcardResponse>>(flashcards);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating flashcards for category {Category}", request.PrimaryCategory);
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

                // Generate the image using the word directly
                var imageUrl = await _aiService.GenerateImageAsync(flashcard.BackWord);

                // Update the flashcard with the image URL
                flashcard.ImageUrl = imageUrl;
                await UpdateFlashcardAsync(flashcard);

                _logger.LogInformation("Generated and set image for flashcard {Id} with word '{Word}'",
                    flashcardId, flashcard.BackWord);

                return imageUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating image for flashcard {Id}", flashcardId);
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

                // Make sure we have a valid front word and example sentence
                if (string.IsNullOrEmpty(flashcard.FrontWord) || string.IsNullOrEmpty(flashcard.ExampleSentence))
                {
                    throw new InvalidOperationException($"Flashcard with ID {flashcardId} has no front word or example sentence");
                }

                // Generate the audio using both the front word and example sentence
                var audioUrl = await _aiService.GenerateAudioAsync(
                    flashcard.FrontWord,
                    flashcard.ExampleSentence);

                // Update the flashcard with the audio URL
                flashcard.AudioUrl = audioUrl;
                await UpdateFlashcardAsync(flashcard);

                _logger.LogInformation("Generated and set audio for flashcard {Id} with word '{Word}'",
                    flashcardId, flashcard.FrontWord);

                return audioUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating audio for flashcard {Id}", flashcardId);
                throw;
            }
        }

        #endregion

        #region Flashcard Retrieval Methods

        private async Task<Flashcard> GetFlashcardByIdAsync(Guid flashcardId)
        {
            var flashcardQuery = _supabaseService.Client
                .From<Flashcard>()
                .Filter("id", Operator.Equals, flashcardId.ToString());

            var result = await flashcardQuery.Get();
            var flashcard = result.Models?.FirstOrDefault();

            if (flashcard == null)
            {
                throw new InvalidOperationException($"Flashcard with ID {flashcardId} not found");
            }

            return flashcard;
        }

        private async Task<List<Flashcard>> GetExistingFlashcardsAsync(FlashcardRequest request)
        {
            int difficultyValue = (int)request.Difficulty;
            int categoryValue = (int)request.PrimaryCategory;

            var query = _supabaseService.Client
                .From<Flashcard>()
                .Filter(f => f.Categories, Operator.Contains, new List<object> { categoryValue })
                .Filter(f => f.Difficulty, Operator.Equals, difficultyValue);

            var result = await query.Get();
            return result.Models?.ToList() ?? new List<Flashcard>();
        }

        private async Task<IEnumerable<FlashcardResponse>> GetFlashcardsWithSpacedRepetitionAsync(
            List<Flashcard> allFlashcards, FlashcardRequest request, string userId)
        {
            // Get all previously shown flashcard IDs
            var shownFlashcardIds = await _userFlashcardStatService.GetShownFlashcardIdsAsync(userId);

            // STEP 1: Get review cards (cards the user has seen before that need review)
            int reviewCount = (int)Math.Ceiling(request.Count * ReviewFlashcardsRatio);
            List<Flashcard> reviewFlashcards = new List<Flashcard>();

            if (shownFlashcardIds.Any())
            {
                // Get flashcard IDs that need review based on mastery level
                var flashcardsToReview = await _userFlashcardStatService.GetFlashcardsDueForReviewAsync(
                    userId, allFlashcards.Select(f => f.Id), reviewCount);

                var reviewIds = flashcardsToReview.Select(f => f.FlashcardId).ToHashSet();

                // Get the actual flashcard objects
                reviewFlashcards = allFlashcards
                    .Where(f => reviewIds.Contains(f.Id))
                    .ToList();

                _logger.LogInformation("Selected {ReviewCount} flashcards for review based on mastery level",
                    reviewFlashcards.Count);
            }

            // STEP 2: Fill the rest with new flashcards the user hasn't seen
            int newCardsNeeded = request.Count - reviewFlashcards.Count;
            var newFlashcards = allFlashcards
                .Where(f => !shownFlashcardIds.Contains(f.Id))
                .OrderBy(_ => _random.Next())
                .Take(newCardsNeeded)
                .ToList();

            _logger.LogInformation("Selected {NewCount} new flashcards the user hasn't seen before",
                newFlashcards.Count);

            // STEP 3: Combine the review and new flashcards
            var selectedFlashcards = reviewFlashcards.Concat(newFlashcards).ToList();

            // STEP 4: If we still need more flashcards, generate them with AI
            int remainingCount = request.Count - selectedFlashcards.Count;
            if (remainingCount > 0)
            {
                _logger.LogInformation("Not enough existing flashcards, generating {RemainingCount} new ones",
                    remainingCount);

                // Create a copy of the request with adjusted count
                var generationRequest = new FlashcardRequest
                {
                    PrimaryCategory = request.PrimaryCategory,
                    Count = remainingCount,
                    UserId = request.UserId,
                    Difficulty = request.Difficulty,
                    Hint = request.Hint
                };

                // Generate and combine
                var newFlashcardResponses = await GenerateFlashcardsAsync(generationRequest);
                var selectedResponses = _mapper.Map<IEnumerable<FlashcardResponse>>(selectedFlashcards);
                return selectedResponses.Concat(newFlashcardResponses).ToList();
            }

            // STEP 5: Mark newly seen flashcards
            if (newFlashcards.Any())
            {
                await _userFlashcardStatService.MarkFlashcardsAsShownAsync(newFlashcards, userId);
            }

            // STEP 6: Shuffle and return the final selection
            return _mapper.Map<IEnumerable<FlashcardResponse>>(
                selectedFlashcards.OrderBy(_ => _random.Next()).ToList());
        }

        #endregion

        #region Flashcard Generation Methods

        private async Task<List<Flashcard>> GenerateUniqueFlashcardsAsync(
            FlashcardRequest request, List<string> randomWords,
            HashSet<string> wordCategoryMap, int categoryValue)
        {
            var generatedFlashcards = await _aiService.GenerateFlashcardsAsync(request, randomWords);

            return generatedFlashcards
                .Where(f => !wordCategoryMap.Contains($"{f.FrontWord.ToLowerInvariant()}:{categoryValue}"))
                .ToList();
        }

        #endregion

        #region Database Operations

        private async Task UpdateFlashcardAsync(Flashcard flashcard)
        {
            await _supabaseService.Client
                .From<Flashcard>()
                .Update(flashcard);
        }

        private async Task SaveFlashcardsToSupabaseAsync(List<Flashcard> flashcards, string? userId = null)
        {
            try
            {
                var result = await _supabaseService.Client
                    .From<Flashcard>()
                    .Insert(flashcards);

                int insertedCount = result.Models?.Count ?? 0;
                _logger.LogInformation("Successfully saved {Count} flashcards to Supabase", insertedCount);

                if (!string.IsNullOrEmpty(userId) && result.Models?.Count > 0)
                {
                    await _userFlashcardStatService.MarkFlashcardsAsShownAsync(result.Models.ToList(), userId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving flashcards to Supabase");
                throw;
            }
        }

        private async Task<(List<string> Words, HashSet<string> CategoryMap)> GetExistingWordsAsync(int categoryValue)
        {
            var existingFlashcardsResult = await _supabaseService.Client
                .From<Flashcard>()
                .Select("front_word, categories")
                .Get();

            var words = new List<string>();
            var categoryMap = new HashSet<string>();

            if (existingFlashcardsResult.Models != null)
            {
                foreach (var flashcard in existingFlashcardsResult.Models)
                {
                    words.Add(flashcard.FrontWord);

                    if (flashcard.Categories.Contains(categoryValue))
                    {
                        categoryMap.Add($"{flashcard.FrontWord.ToLowerInvariant()}:{categoryValue}");
                    }
                }
            }

            return (words, categoryMap);
        }

        #endregion

        #region Utility Methods

        private void ValidateInputs(FlashcardRequest request, string userId)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            if (string.IsNullOrEmpty(userId))
            {
                throw new ArgumentNullException(nameof(userId));
            }
        }

        private List<string> SelectRandomWords(List<string> words, int maxCount)
        {
            return words.Count <= maxCount
                ? words
                : words.OrderBy(_ => _random.Next()).Take(maxCount).ToList();
        }

        private void LogGenerationDetails(FlashcardRequest request, int randomCount, int totalCount)
        {
            _logger.LogInformation(
                "Generating flashcards for category '{Category}' with difficulty '{Difficulty}'{Hint} (using {RandomCount} random words from {TotalCount} total)",
                request.PrimaryCategory,
                request.Difficulty,
                FormatHintMessage(request.Hint),
                randomCount,
                totalCount);
        }

        private string FormatHintMessage(string? hint)
        {
            return !string.IsNullOrEmpty(hint) ? $" and hint '{hint}'" : string.Empty;
        }

        #endregion
    }
}
