using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.AI;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Flashcards;
using Lithuaningo.API.Services.Stats;
using Lithuaningo.API.Services.Supabase;
using Microsoft.Extensions.Logging;
using Supabase;

namespace Lithuaningo.API.Services.Challenges
{
    /// <summary>
    /// A service for generating and retrieving daily challenge questions.
    /// If no questions exist for today, they are automatically created.
    /// </summary>
    public class ChallengeService : IChallengeService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly ICacheSettingsService _cacheSettingsService;
        private const string CacheKeyPrefix = "challenge:";
        private readonly ILogger<ChallengeService> _logger;
        private readonly IMapper _mapper;
        private readonly IAIService _aiService;
        private readonly IUserFlashcardStatService _userFlashcardStatService;

        public ChallengeService(
            ISupabaseService supabaseService,
            ICacheService cache,
            ICacheSettingsService cacheSettingsService,
            ILogger<ChallengeService> logger,
            IMapper mapper,
            IAIService aiService,
            IUserFlashcardStatService userFlashcardStatService)
        {
            _supabaseClient = supabaseService.Client ?? throw new ArgumentNullException(nameof(supabaseService));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _cacheSettingsService = cacheSettingsService ?? throw new ArgumentNullException(nameof(cacheSettingsService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _aiService = aiService ?? throw new ArgumentNullException(nameof(aiService));
            _userFlashcardStatService = userFlashcardStatService ?? throw new ArgumentNullException(nameof(userFlashcardStatService));
        }

        /// <summary>
        /// Gets or generates daily challenge questions. Will retrieve from cache if available 
        /// for the current day, otherwise will generate new ones.
        /// </summary>
        /// <returns>The daily challenge questions</returns>
        public async Task<IEnumerable<ChallengeQuestionResponse>> GetDailyChallengeQuestionsAsync()
        {
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var cacheKey = $"{CacheKeyPrefix}daily:{today}";

            var cachedQuestions = await _cache.GetAsync<List<ChallengeQuestionResponse>>(cacheKey);
            if (cachedQuestions != null && cachedQuestions.Any())
            {
                _logger.LogInformation("Retrieved daily challenge questions from cache for {Today}", today);
                return cachedQuestions;
            }

            _logger.LogInformation("Cache miss for daily challenge questions for {Today}. Fetching from Supabase RPC.", today);

            try
            {
                // Call the Supabase RPC function
                var response = await _supabaseClient.Rpc("get_random_challenge_questions", new Dictionary<string, object> { { "count", 10 } });

                if (response.ResponseMessage != null && response.ResponseMessage.IsSuccessStatusCode && !string.IsNullOrEmpty(response.Content))
                {
                    var questions = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ChallengeQuestion>>(response.Content);

                    if (questions == null || !questions.Any())
                    {
                        _logger.LogWarning("RPC get_random_challenge_questions returned no questions or failed to deserialize.");
                        // Fallback or error handling: Potentially try AI generation or return empty
                        // For now, let's log and return empty to avoid breaking if AI is not set up for this path.
                        return Enumerable.Empty<ChallengeQuestionResponse>();
                    }

                    var questionResponses = _mapper.Map<List<ChallengeQuestionResponse>>(questions);

                    var settings = await _cacheSettingsService.GetCacheSettingsAsync();
                    var expiration = TimeSpan.FromHours(settings.DefaultExpirationMinutes > 0 ? settings.DefaultExpirationMinutes / 60.0 : 24); // Example: 24 hours
                    await _cache.SetAsync(cacheKey, questionResponses, expiration);
                    _logger.LogInformation("Successfully fetched and cached {Count} daily challenge questions.", questionResponses.Count);
                    return questionResponses;
                }
                else
                {
                    string errorDetail = response.Content ?? string.Empty; // Ensure non-null
                    if (response.ResponseMessage != null && !response.ResponseMessage.IsSuccessStatusCode)
                    {
                        errorDetail = $"HTTP Status: {response.ResponseMessage.StatusCode}, Reason: {response.ResponseMessage.ReasonPhrase}, Content: {response.Content ?? string.Empty}";
                    }
                    _logger.LogError("Error calling Supabase RPC get_random_challenge_questions. Details: {ErrorDetails}", errorDetail);
                    // Fallback or error handling
                    return Enumerable.Empty<ChallengeQuestionResponse>();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching daily challenge questions via RPC.");
                // Consider a fallback to AI generation here if appropriate, or just rethrow/return empty
                return Enumerable.Empty<ChallengeQuestionResponse>();
            }
        }

        public async Task<IEnumerable<ChallengeQuestionResponse>> GetChallengeQuestionsForSeenFlashcardsAsync(string userId, int count = 10)
        {
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("User ID is null or empty for review challenge generation.");
                throw new ArgumentNullException(nameof(userId));
            }
            if (count <= 0) count = 10;

            _logger.LogInformation("Generating {Count} review challenge questions for user {UserId}", count, userId);

            var seenFlashcardIds = await _userFlashcardStatService.GetLastSeenFlashcardIdsAsync(userId, count * 2); // Get more flashcards initially to ensure we find enough questions
            if (!seenFlashcardIds.Any())
            {
                _logger.LogInformation("No flashcards found for user {UserId} to generate review challenges.", userId);
                return new List<ChallengeQuestionResponse>();
            }

            // Fetch all challenges associated with these flashcard IDs in one go
            var allReviewChallenges = await _supabaseClient.From<ChallengeQuestion>()
                .Where(cq => cq.FlashcardId.HasValue && seenFlashcardIds.Contains(cq.FlashcardId.Value))
                .Get();

            if (allReviewChallenges.Models == null || !allReviewChallenges.Models.Any())
            {
                _logger.LogInformation("No existing challenge questions found for the review flashcards of user {UserId}.", userId);
                return new List<ChallengeQuestionResponse>();
            }

            // Shuffle all available challenges and take the required count
            var selectedChallengeModels = allReviewChallenges.Models
                .Take(count)
                .ToList();

            if (!selectedChallengeModels.Any())
            {
                _logger.LogInformation("No challenges selected after attempting to fetch for user {UserId} (this shouldn't happen if models were found).", userId);
                return new List<ChallengeQuestionResponse>();
            }

            var response = _mapper.Map<List<ChallengeQuestionResponse>>(selectedChallengeModels);

            _logger.LogInformation("Retrieved {Count} existing review challenge questions for user {UserId}", response.Count, userId);
            return response;
        }

        public async Task GenerateAndSaveChallengesForFlashcardAsync(Flashcard flashcard)
        {
            if (flashcard == null)
            {
                throw new ArgumentNullException(nameof(flashcard));
            }

            _logger.LogInformation("Generating and saving challenges for flashcard ID: {FlashcardId}", flashcard.Id);

            try
            {
                var challengeDtos = await _aiService.GenerateChallengesForFlashcardAsync(flashcard);

                if (challengeDtos == null || !challengeDtos.Any())
                {
                    _logger.LogWarning("AI Service returned no challenges for flashcard ID: {FlashcardId}", flashcard.Id);
                    return; // Or throw, depending on desired behavior for empty generation
                }

                var challengeModels = _mapper.Map<List<ChallengeQuestion>>(challengeDtos);
                if (challengeModels == null || !challengeModels.Any())
                {
                    _logger.LogWarning("Mapped challenge models are null or empty for flashcard ID: {FlashcardId}", flashcard.Id);
                    return;
                }

                foreach (var model in challengeModels)
                {
                    model.FlashcardId = flashcard.Id; // Ensure FlashcardId is set
                    if (model.Id == Guid.Empty) model.Id = Guid.NewGuid();
                    // CreatedAt/UpdatedAt are handled by DB
                }

                // Inlined SaveChallengeQuestionsAsync logic:
                try
                {
                    await _supabaseClient.From<ChallengeQuestion>().Insert(challengeModels);
                    _logger.LogInformation("{Count} challenge questions saved to the database for flashcard ID: {FlashcardId}.", challengeModels.Count, flashcard.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error saving challenge questions to database for flashcard ID: {FlashcardId}", flashcard.Id);
                    throw; // Re-throw to indicate failure in the saving step
                }
                // End of inlined logic

                _logger.LogInformation("Successfully generated and saved {Count} challenges for flashcard ID: {FlashcardId}", challengeModels.Count, flashcard.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating or saving challenges for flashcard ID: {FlashcardId}", flashcard.Id);
                throw new InvalidOperationException($"Failed to generate and save challenges for flashcard {flashcard.Id}.", ex);
            }
        }

        public async Task ClearChallengesByFlashcardIdAsync(Guid flashcardId)
        {
            if (flashcardId == Guid.Empty)
            {
                _logger.LogWarning("Attempted to clear challenges with an empty flashcard ID.");
                return; // Or throw ArgumentException
            }

            try
            {
                _logger.LogInformation("Clearing challenge questions for flashcard ID {FlashcardId}", flashcardId);

                // Delete all challenge questions where flashcard_id matches
                await _supabaseClient
                    .From<ChallengeQuestion>()
                    .Where(cq => cq.FlashcardId == flashcardId) // Ensure your ChallengeQuestion model has FlashcardId
                    .Delete();

                _logger.LogInformation("Successfully cleared challenge questions for flashcard ID {FlashcardId}", flashcardId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing challenge questions for flashcard ID {FlashcardId}", flashcardId);
                // Re-throw or handle as appropriate for your application's error strategy
                throw;
            }
        }
    }
}
