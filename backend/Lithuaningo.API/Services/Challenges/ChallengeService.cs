using AutoMapper;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.AI;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Flashcards;
using Lithuaningo.API.Services.Stats;
using Lithuaningo.API.Services.Supabase;
using Supabase;
using static Supabase.Postgrest.Constants;
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
        private readonly IFlashcardService _flashcardService;
        private readonly IUserFlashcardStatService _userFlashcardStatService;
        private readonly Random _random;

        public ChallengeService(
            ISupabaseService supabaseService,
            ICacheService cache,
            ICacheSettingsService cacheSettingsService,
            ILogger<ChallengeService> logger,
            IMapper mapper,
            IAIService aiService,
            IFlashcardService flashcardService,
            IUserFlashcardStatService userFlashcardStatService,
            Random random)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettingsService = cacheSettingsService;
            _logger = logger;
            _mapper = mapper;
            _aiService = aiService;
            _flashcardService = flashcardService;
            _userFlashcardStatService = userFlashcardStatService;
            _random = random;
        }

        /// <summary>
        /// Gets or generates daily challenge questions. Will retrieve from cache if available 
        /// for the current day, otherwise will generate new ones.
        /// </summary>
        /// <returns>The daily challenge questions</returns>
        public async Task<IEnumerable<ChallengeQuestionResponse>> GetDailyChallengeQuestionsAsync()
        {
            // Create a daily cache key in the format "challenge:daily:YYYY-MM-DD"
            string cacheKey = $"{CacheKeyPrefix}daily:{DateTime.UtcNow:yyyy-MM-dd}";

            // Try to get from cache first
            var cachedQuestions = await _cache.GetAsync<List<ChallengeQuestionResponse>>(cacheKey);
            if (cachedQuestions != null && cachedQuestions.Count > 0)
            {
                return cachedQuestions;
            }

            // Retrieve cache settings once - will be used in both paths
            var cacheSettings = await _cacheSettingsService.GetCacheSettingsAsync();
            var cacheExpiration = TimeSpan.FromHours(cacheSettings.DefaultExpirationMinutes);

            // Check if we already have questions for today in the database
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var existingQuestions = await _supabaseClient
                .From<ChallengeQuestion>()
                .Filter("created_at", Operator.GreaterThanOrEqual, today.ToString("yyyy-MM-dd"))
                .Filter("created_at", Operator.LessThan, tomorrow.ToString("yyyy-MM-dd"))
                .Order("created_at", Ordering.Descending)
                .Limit(10)
                .Get();

            if (existingQuestions.Models != null && existingQuestions.Models.Count > 0)
            {
                var questionResponses = _mapper.Map<List<ChallengeQuestionResponse>>(existingQuestions.Models);

                // Cache the results
                await _cache.SetAsync(cacheKey, questionResponses, cacheExpiration);

                return questionResponses;
            }

            // If we get here, we need to generate new questions
            var newQuestions = await GenerateAIChallengeQuestionsAsync();

            // Cache the results for today
            await _cache.SetAsync(cacheKey, newQuestions.ToList(), cacheExpiration);

            return newQuestions;
        }

        /// <summary>
        /// Generates new challenge questions using AI based on random flashcards as context.
        /// </summary>
        public async Task<IEnumerable<ChallengeQuestionResponse>> GenerateAIChallengeQuestionsAsync()
        {
            try
            {
                // Get a larger set of random flashcards from the database for context
                // We retrieve more flashcards to ensure sufficient diversity for all question types
                var flashcards = await _flashcardService.RetrieveFlashcardModelsAsync(
                    limit: 25); // Increased from 10 to 25 to ensure more diversity

                if (flashcards.Any())
                {
                    // Shuffle the flashcards for better randomization
                    var shuffledFlashcards = flashcards.ToList().OrderBy(x => _random.Next()).ToList();

                    // Generate challenges based on the flashcard data
                    var questions = await _aiService.GenerateChallengesAsync(shuffledFlashcards);

                    // Save the generated questions to the database
                    await SaveChallengeQuestionsToDatabase(questions);

                    return questions;
                }
                else
                {
                    _logger.LogWarning("No flashcards found to use as context for challenge generation. Generating challenges without context.");
                    return await _aiService.GenerateChallengesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating AI challenge questions");
                throw;
            }
        }

        /// <summary>
        /// Saves challenge questions to the Supabase database
        /// </summary>
        private async Task SaveChallengeQuestionsToDatabase(IEnumerable<ChallengeQuestionResponse> questions)
        {
            try
            {
                // Map DTO responses to database models
                var questionModels = _mapper.Map<List<ChallengeQuestion>>(questions);

                // Save to database
                var result = await _supabaseClient
                    .From<ChallengeQuestion>()
                    .Insert(questionModels);

                if (result.Models == null)
                {
                    _logger.LogWarning("No challenge questions were saved to the database");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving challenge questions to database");
                throw;
            }
        }

        public async Task<IEnumerable<ChallengeQuestionResponse>> GenerateReviewChallengeQuestionsAsync(string userId, int count = 10)
        {
            _logger.LogInformation("Generating review challenge questions for based on last seen flashcards.");

            try
            {
                // 1. Get the IDs of the last 'count' flashcards seen by the user
                var lastSeenFlashcardIds = await _userFlashcardStatService.GetLastSeenFlashcardIdsAsync(userId, count);

                if (!lastSeenFlashcardIds.Any())
                {
                    _logger.LogInformation("The user has not seen any flashcards yet, or no seen flashcards could be retrieved. Cannot generate review challenge.");
                    return Enumerable.Empty<ChallengeQuestionResponse>();
                }

                var flashcardsForChallenge = new List<Flashcard>();

                // 2. Fetch the full flashcard models for these IDs
                foreach (var flashcardId in lastSeenFlashcardIds)
                {
                    try
                    {
                        var flashcard = await _flashcardService.GetFlashcardByIdAsync(flashcardId);
                        if (flashcard != null)
                        {
                            flashcardsForChallenge.Add(flashcard);
                        }
                        else
                        {
                            _logger.LogWarning("Could not retrieve flashcard (one of the last seen) for review challenge generation.");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Exception while retrieving flashcard for review challenge generation.");
                    }
                }

                if (!flashcardsForChallenge.Any())
                {
                    _logger.LogWarning("No valid flashcard models could be retrieved from the last seen IDs for user {UserId} to generate a review challenge.", userId);
                    return Enumerable.Empty<ChallengeQuestionResponse>();
                }

                // 3. Generate challenges using AI Service
                var distinctFlashcardsForAI = flashcardsForChallenge.DistinctBy(f => f.Id).ToList();

                if (!distinctFlashcardsForAI.Any())
                {
                    _logger.LogWarning("No distinct flashcards available for AI generation for user review challenge.");
                    return Enumerable.Empty<ChallengeQuestionResponse>();
                }

                var generatedChallenges = await _aiService.GenerateChallengesAsync(distinctFlashcardsForAI);

                var finalChallenges = generatedChallenges.Take(count).ToList();

                _logger.LogInformation("Successfully generated review challenge questions based on recently seen flashcards.");
                return finalChallenges;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating review challenge questions for user.");
                throw;
            }
        }
    }
}
