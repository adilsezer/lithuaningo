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
using Lithuaningo.API.DTOs.Quiz;
using Lithuaningo.API.Models.Quiz;
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
    /// A service for generating and retrieving daily quiz questions.
    /// If no questions exist for today, they are automatically created.
    /// </summary>
    public class QuizService : IQuizService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "quiz:";
        private readonly ILogger<QuizService> _logger;
        private readonly IMapper _mapper;
        private readonly CacheInvalidator _cacheInvalidator;
        private readonly IAIService _aiService;

        public QuizService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<QuizService> logger,
            IMapper mapper,
            CacheInvalidator cacheInvalidator,
            IAIService aiService)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger;
            _mapper = mapper;
            _cacheInvalidator = cacheInvalidator;
            _aiService = aiService;
        }

        /// <summary>
        /// Retrieves quiz questions for the current day from Supabase.
        /// </summary>
        public async Task<IEnumerable<QuizQuestionResponse>> GetDailyQuizQuestionsAsync()
        {
            var today = DateTime.UtcNow.Date.ToString("yyyy-MM-dd");
            var cacheKey = $"{CacheKeyPrefix}daily:{today}";
            var cached = await _cache.GetAsync<IEnumerable<QuizQuestionResponse>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved daily quiz questions from cache for {Date}", today);
                return cached;
            }

            try
            {
                var todayDate = DateTime.Parse(today);
                var startOfDay = todayDate;
                var endOfDay = todayDate.AddDays(1).AddTicks(-1);

                var response = await _supabaseClient
                    .From<QuizQuestion>()
                    .Where(q => q.CreatedAt >= startOfDay && q.CreatedAt <= endOfDay)
                    .Get();

                var questions = response.Models;
                
                if (questions == null || !questions.Any())
                {
                    _logger.LogInformation("No quiz questions found for {Date}, generating new ones using AI", today);
                    return await GenerateAIQuizQuestionsAsync();
                }
                
                var questionResponses = _mapper.Map<IEnumerable<QuizQuestionResponse>>(questions);

                await _cache.SetAsync(cacheKey, questionResponses,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved {Count} quiz questions for {Date}", questions.Count, today);

                return questionResponses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily quiz questions for {Date}", today);
                throw;
            }
        }

        /// <summary>
        /// Generates new quiz questions using AI without checking if questions already exist.
        /// </summary>
        public async Task<IEnumerable<QuizQuestionResponse>> GenerateAIQuizQuestionsAsync()
        {
            try
            {
                _logger.LogInformation("Generating quiz questions using AI service");
                
                // Use the AIService to generate questions
                var generatedQuestions = await _aiService.GenerateQuizQuestionsAsync();
                
                // Convert the generated questions to database entities
                var questions = generatedQuestions.Select(q => new QuizQuestion
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
                    .From<QuizQuestion>()
                    .Insert(questions);

                // Map the questions to DTOs
                var responses = _mapper.Map<IEnumerable<QuizQuestionResponse>>(questions);

                // Set today's date for the generated questions
                var today = DateTime.UtcNow.Date.ToString("yyyy-MM-dd");
                
                // Store in cache
                await _cache.SetAsync(
                    $"{CacheKeyPrefix}{today}",
                    responses,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes)
                );

                return responses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating quiz questions using AI");
                throw;
            }
        }
    }
}
