using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Encodings.Web;
using System.Text.RegularExpressions;
using System.Text.Unicode;
using System.Threading.Tasks;
using AutoMapper;
using Lithuaningo.API.DTOs.Challenge;
using Lithuaningo.API.Models.Challenge;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Supabase;
using static Supabase.Postgrest.Constants;
using Lithuaningo.API.Services.AI;

namespace Lithuaningo.API.Services
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
        private readonly CacheInvalidator _cacheInvalidator;
        private readonly IAIService _aiService;
        private readonly IDeckService _deckService;

        public ChallengeService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<ChallengeService> logger,
            IMapper mapper,
            CacheInvalidator cacheInvalidator,
            IAIService aiService,
            IDeckService deckService)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger;
            _mapper = mapper;
            _cacheInvalidator = cacheInvalidator;
            _aiService = aiService;
            _deckService = deckService;
        }

        /// <summary>
        /// Retrieves challenge questions for the current day from Supabase.
        /// </summary>
        public async Task<IEnumerable<ChallengeQuestionResponse>> GetDailyChallengeQuestionsAsync()
        {
            var today = DateTime.UtcNow.Date.ToString("yyyy-MM-dd");
            var cacheKey = $"{CacheKeyPrefix}daily:{today}";
            var cached = await _cache.GetAsync<IEnumerable<ChallengeQuestionResponse>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved daily challenge questions from cache for {Date}", today);
                return cached;
            }

            try
            {
                var todayDate = DateTime.Parse(today);
                var startOfDay = todayDate;
                var endOfDay = todayDate.AddDays(1).AddTicks(-1);

                var response = await _supabaseClient
                    .From<ChallengeQuestion>()
                    .Where(q => q.CreatedAt >= startOfDay && q.CreatedAt <= endOfDay)
                    .Get();

                var questions = response.Models;
                
                if (questions == null || !questions.Any())
                {
                    _logger.LogInformation("No challenge questions found for {Date}, generating new ones using AI", today);
                    var generatedQuestions = await GenerateAIChallengeQuestionsAsync();
                    
                    if (!generatedQuestions.Any())
                    {
                        _logger.LogWarning("Could not generate questions from flashcards for {Date}", today);
                        return Enumerable.Empty<ChallengeQuestionResponse>();
                    }
                    
                    return generatedQuestions;
                }
                
                var questionResponses = _mapper.Map<IEnumerable<ChallengeQuestionResponse>>(questions);

                await _cache.SetAsync(cacheKey, questionResponses,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved {Count} challenge questions for {Date}", questions.Count, today);

                return questionResponses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily challenge questions for {Date}", today);
                throw;
            }
        }

        /// <summary>
        /// Generates new challenge questions using AI without checking if questions already exist.
        /// </summary>
        public async Task<IEnumerable<ChallengeQuestionResponse>> GenerateAIChallengeQuestionsAsync()
        {
            try
            {
                _logger.LogInformation("Generating challenge questions using AI service with flashcards");
                
                // Get 10 random deck IDs
                var randomDeckIds = await _deckService.GetRandomDeckIdsAsync(10);
                if (randomDeckIds.Count == 0)
                {
                    _logger.LogWarning("No deck IDs found for flashcard-based challenge generation");
                    return Enumerable.Empty<ChallengeQuestionResponse>();
                }
                
                // Collect flashcards from all random decks
                var allFlashcards = new List<Models.Flashcard>();
                foreach (var deckId in randomDeckIds)
                {
                    var deckFlashcards = await _deckService.GetDeckFlashcardsAsync(deckId);
                    if (deckFlashcards.Any())
                    {
                        allFlashcards.AddRange(deckFlashcards);
                    }
                }
                
                if (allFlashcards.Count == 0)
                {
                    _logger.LogWarning("No flashcards found in the selected decks");
                    return Enumerable.Empty<ChallengeQuestionResponse>();
                }
                
                // Randomize and take up to 20 flashcards to avoid overwhelming the AI
                var random = new Random();
                var selectedFlashcards = allFlashcards
                    .OrderBy(x => random.Next())
                    .Take(20)
                    .ToList();
                
                _logger.LogInformation("Selected {Count} flashcards from {DeckCount} decks for challenge generation", 
                    selectedFlashcards.Count, randomDeckIds.Count);
                
                // Use the AIService to generate questions based on the selected flashcards
                var generatedQuestions = await _aiService.GenerateChallengeQuestionsAsync(selectedFlashcards);
                
                // Convert the generated questions to database entities
                var questions = generatedQuestions.Select(q => new ChallengeQuestion
                {
                    Id = Guid.NewGuid(),
                    Question = q.Question,
                    Options = q.Options,
                    CorrectAnswer = q.CorrectAnswer,
                    ExampleSentence = q.ExampleSentence,
                    Type = q.Type,
                    CreatedAt = DateTime.UtcNow,
                }).ToList();

                // Insert the questions into the database
                await _supabaseClient
                    .From<ChallengeQuestion>()
                    .Insert(questions);
                    
                return _mapper.Map<IEnumerable<ChallengeQuestionResponse>>(questions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating AI challenge questions from flashcards");
                throw;
            }
        }

        /// <summary>
        /// Generates challenge questions for a specific deck using its flashcards.
        /// </summary>
        /// <param name="deckId">The ID of the deck to generate questions for</param>
        /// <returns>The generated challenge questions for the specific deck</returns>
        public async Task<IEnumerable<ChallengeQuestionResponse>> GenerateDeckChallengeQuestionsAsync(string deckId)
        {
            try
            {
                _logger.LogInformation("Generating challenge questions for deck {DeckId}", deckId);
                
                // Validate deck ID
                if (string.IsNullOrEmpty(deckId))
                {
                    _logger.LogWarning("Invalid deck ID provided");
                    return Enumerable.Empty<ChallengeQuestionResponse>();
                }
                
                // Get the flashcards for this specific deck
                var flashcards = await _deckService.GetDeckFlashcardsAsync(deckId);
                
                if (flashcards == null || !flashcards.Any())
                {
                    _logger.LogWarning("No flashcards found for deck {DeckId}", deckId);
                    return Enumerable.Empty<ChallengeQuestionResponse>();
                }
                
                _logger.LogInformation("Found {Count} flashcards for deck {DeckId}", flashcards.Count, deckId);
                
                // If there are too many flashcards, select a subset to avoid overwhelming the AI
                var selectedFlashcards = flashcards;
                if (flashcards.Count > 20)
                {
                    var random = new Random();
                    selectedFlashcards = flashcards
                        .OrderBy(x => random.Next())
                        .Take(20)
                        .ToList();
                    
                    _logger.LogInformation("Selected {Count} flashcards from {TotalCount} for deck {DeckId}", 
                        selectedFlashcards.Count, flashcards.Count, deckId);
                }
                
                // Use the AIService to generate questions based on the selected flashcards
                var generatedQuestions = await _aiService.GenerateChallengeQuestionsAsync(selectedFlashcards);
                
                // Convert the generated questions to database entities
                var questions = generatedQuestions.Select(q => new ChallengeQuestion
                {
                    Id = Guid.NewGuid(),
                    Question = q.Question,
                    Options = q.Options,
                    CorrectAnswer = q.CorrectAnswer,
                    ExampleSentence = q.ExampleSentence,
                    Type = q.Type,
                    CreatedAt = DateTime.UtcNow,
                }).ToList();
                    
                return _mapper.Map<IEnumerable<ChallengeQuestionResponse>>(questions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating challenge questions for deck {DeckId}", deckId);
                throw;
            }
        }
    }
}
