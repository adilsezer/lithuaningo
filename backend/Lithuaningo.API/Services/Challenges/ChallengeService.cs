using AutoMapper;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.AI;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Flashcards;
using Lithuaningo.API.Services.Supabase;
using Microsoft.Extensions.Options;
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
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "challenge:";
        private readonly ILogger<ChallengeService> _logger;
        private readonly IMapper _mapper;
        private readonly IAIService _aiService;
        private readonly IFlashcardService _flashcardService;
        private readonly Random _random;

        public ChallengeService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<ChallengeService> logger,
            IMapper mapper,
            IAIService aiService,
            IFlashcardService flashcardService,
            Random random)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger;
            _mapper = mapper;
            _aiService = aiService;
            _flashcardService = flashcardService;
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
                _logger.LogInformation("Retrieved {Count} daily challenge questions from cache", cachedQuestions.Count);
                return cachedQuestions;
            }

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
                await _cache.SetAsync(cacheKey, questionResponses,
                    TimeSpan.FromHours(_cacheSettings.DefaultExpirationMinutes));

                _logger.LogInformation("Retrieved {Count} daily challenge questions from database", questionResponses.Count);
                return questionResponses;
            }

            // If we get here, we need to generate new questions
            var newQuestions = await GenerateAIChallengeQuestionsAsync();

            // Cache the results for today
            await _cache.SetAsync(cacheKey, newQuestions.ToList(),
                TimeSpan.FromHours(_cacheSettings.DefaultExpirationMinutes));

            return newQuestions;
        }

        /// <summary>
        /// Generates new challenge questions using AI based on random flashcards as context.
        /// </summary>
        public async Task<IEnumerable<ChallengeQuestionResponse>> GenerateAIChallengeQuestionsAsync()
        {
            try
            {
                _logger.LogInformation("Getting random flashcards to use as context for challenge generation");

                // Get random flashcards from the database for context
                var flashcards = await _flashcardService.RetrieveFlashcardModelsAsync(
                    limit: 10);

                if (flashcards.Count() > 0)
                {
                    _logger.LogInformation("Retrieved {Count} flashcards to use as context for challenge generation", flashcards.Count());

                    // Generate challenges based on the flashcard data
                    var questions = await _aiService.GenerateChallengesAsync(flashcards);

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

                if (result.Models != null)
                {
                    _logger.LogInformation("Successfully saved {Count} challenge questions to database", result.Models.Count);
                }
                else
                {
                    _logger.LogWarning("No challenge questions were saved to the database");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving challenge questions to database");
                // Don't rethrow - treat database save as best-effort
            }
        }
    }
}
