using AutoMapper;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.AI;
using Lithuaningo.API.Services.Cache;
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
        private readonly IUserFlashcardStatService _userFlashcardStatService;
        private readonly Random _random;

        public ChallengeService(
            ISupabaseService supabaseService,
            ICacheService cache,
            ICacheSettingsService cacheSettingsService,
            ILogger<ChallengeService> logger,
            IMapper mapper,
            IAIService aiService,
            IUserFlashcardStatService userFlashcardStatService,
            Random random)
        {
            _supabaseClient = supabaseService.Client ?? throw new ArgumentNullException(nameof(supabaseService));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _cacheSettingsService = cacheSettingsService ?? throw new ArgumentNullException(nameof(cacheSettingsService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _aiService = aiService ?? throw new ArgumentNullException(nameof(aiService));
            _userFlashcardStatService = userFlashcardStatService ?? throw new ArgumentNullException(nameof(userFlashcardStatService));
            _random = random ?? throw new ArgumentNullException(nameof(random));
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
                return cachedQuestions;
            }

            try
            {
                // Call the Supabase RPC function
                var response = await _supabaseClient.Rpc("get_random_challenge_questions", new Dictionary<string, object> { { "count", 10 } });

                if (response.ResponseMessage != null && response.ResponseMessage.IsSuccessStatusCode && !string.IsNullOrEmpty(response.Content))
                {
                    var questions = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ChallengeQuestion>>(response.Content);

                    if (questions == null || !questions.Any())
                    {
                        return Enumerable.Empty<ChallengeQuestionResponse>();
                    }

                    var questionResponses = _mapper.Map<List<ChallengeQuestionResponse>>(questions);

                    var settings = await _cacheSettingsService.GetCacheSettingsAsync();
                    var expiration = TimeSpan.FromHours(settings.DefaultExpirationMinutes > 0 ? settings.DefaultExpirationMinutes / 60.0 : 24); // Example: 24 hours
                    await _cache.SetAsync(cacheKey, questionResponses, expiration);
                    return questionResponses;
                }
                else
                {
                    _logger.LogError("Error calling Supabase RPC get_random_challenge_questions");
                    return Enumerable.Empty<ChallengeQuestionResponse>();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching daily challenge questions via RPC");
                return Enumerable.Empty<ChallengeQuestionResponse>();
            }
        }

        public async Task<IEnumerable<ChallengeQuestionResponse>> GetChallengeQuestionsForSeenFlashcardsAsync(GetReviewChallengeQuestionsRequest request)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }
            if (string.IsNullOrEmpty(request.UserId))
            {
                throw new ArgumentException("UserId must be provided in the request", nameof(request));
            }

            var count = request.Count <= 0 ? 10 : request.Count;

            var seenFlashcardIds = await _userFlashcardStatService.GetLastSeenFlashcardIdsAsync(request.UserId, count * 2);

            if (!seenFlashcardIds.Any())
            {
                return new List<ChallengeQuestionResponse>();
            }

            List<Guid> filteredFlashcardIds = seenFlashcardIds;

            // Apply category and/or difficulty filtering if specified
            bool needsFiltering = request.Difficulty.HasValue ||
                (!string.IsNullOrEmpty(request.CategoryId) && int.TryParse(request.CategoryId, out var categoryInt) && categoryInt != -1);

            if (needsFiltering)
            {
                // Convert Guid list to object list for the IN operator
                var seenFlashcardIdsAsObjects = seenFlashcardIds.Cast<object>().ToList();

                var query = _supabaseClient.From<Flashcard>()
                    .Filter(f => f.Id, Operator.In, seenFlashcardIdsAsObjects);

                // Apply category filter if specified and not AllCategories (-1)
                if (!string.IsNullOrEmpty(request.CategoryId) && int.TryParse(request.CategoryId, out categoryInt) && categoryInt != -1)
                {
                    query = query.Filter(f => f.Categories, Operator.Contains, new List<object> { categoryInt });
                }

                // Apply difficulty filter if specified
                if (request.Difficulty.HasValue)
                {
                    query = query.Filter(f => f.Difficulty, Operator.Equals, (int)request.Difficulty.Value);
                }

                var filteredFlashcards = await query.Get();

                if (filteredFlashcards.Models != null && filteredFlashcards.Models.Any())
                {
                    filteredFlashcardIds = filteredFlashcards.Models.Select(f => f.Id).ToList();
                }
                else
                {
                    return new List<ChallengeQuestionResponse>();
                }
            }

            // Fetch all challenges associated with these filtered flashcard IDs
            var filteredFlashcardIdsAsObjects = filteredFlashcardIds.Cast<object>().ToList();

            var allReviewChallenges = await _supabaseClient.From<ChallengeQuestion>()
                .Filter(cq => cq.FlashcardId!, Operator.In, filteredFlashcardIdsAsObjects)
                .Get();

            if (allReviewChallenges.Models == null || !allReviewChallenges.Models.Any())
            {
                return new List<ChallengeQuestionResponse>();
            }

            // Shuffle all available challenges and take the required count
            var shuffledChallenges = allReviewChallenges.Models
                .OrderBy(x => _random.Next())
                .ToList();

            var selectedChallengeModels = shuffledChallenges
                .Take(count)
                .ToList();

            if (!selectedChallengeModels.Any())
            {
                return new List<ChallengeQuestionResponse>();
            }

            // Log a warning if we're returning fewer challenges than requested
            if (selectedChallengeModels.Count < count)
            {
                _logger.LogWarning("Returning {ActualCount} challenges instead of requested {RequestedCount}. " +
                    "User needs to practice more flashcards to get more review challenges.",
                    selectedChallengeModels.Count, count);
            }

            var response = _mapper.Map<List<ChallengeQuestionResponse>>(selectedChallengeModels);

            return response;
        }

        public async Task GenerateAndSaveChallengesForFlashcardAsync(Flashcard flashcard)
        {
            if (flashcard == null)
            {
                throw new ArgumentNullException(nameof(flashcard));
            }

            try
            {
                var challengeDtos = await _aiService.GenerateChallengesForFlashcardAsync(flashcard);

                if (challengeDtos == null || !challengeDtos.Any())
                {
                    return;
                }

                var challengeModels = _mapper.Map<List<ChallengeQuestion>>(challengeDtos);
                if (challengeModels == null || !challengeModels.Any())
                {
                    return;
                }

                foreach (var model in challengeModels)
                {
                    model.FlashcardId = flashcard.Id; // Ensure FlashcardId is set
                    if (model.Id == Guid.Empty) model.Id = Guid.NewGuid();
                    // CreatedAt/UpdatedAt are handled by DB
                }

                try
                {
                    await _supabaseClient.From<ChallengeQuestion>().Insert(challengeModels);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error saving challenge questions to database");
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating or saving challenges for flashcard");
                throw new InvalidOperationException("Failed to generate and save challenges for flashcard.", ex);
            }
        }

        public async Task ClearChallengesByFlashcardIdAsync(Guid flashcardId)
        {
            if (flashcardId == Guid.Empty)
            {
                return;
            }

            try
            {
                await _supabaseClient
                    .From<ChallengeQuestion>()
                    .Where(cq => cq.FlashcardId == flashcardId)
                    .Delete();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing challenge questions");
                throw;
            }
        }
    }
}
