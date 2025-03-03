using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Models.Quiz;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Services.Cache;
using Microsoft.Extensions.Options;
using static Supabase.Postgrest.Constants;
using Supabase;
using Lithuaningo.API.DTOs.Quiz;
using AutoMapper;

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

        public QuizService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<QuizService> logger,
            IMapper mapper,
            CacheInvalidator cacheInvalidator)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _cacheInvalidator = cacheInvalidator ?? throw new ArgumentNullException(nameof(cacheInvalidator));
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
                var response = await _supabaseClient
                    .From<QuizQuestion>()
                    .Where(q => q.CreatedAt.Date == DateTime.Parse(today).Date)
                    .Get();

                var questions = response.Models;
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
        /// Creates new quiz questions for the day.
        /// </summary>
        /// <param name="questions">The quiz questions to create</param>
        public async Task<IEnumerable<QuizQuestionResponse>> CreateDailyQuizQuestionsAsync(IEnumerable<CreateQuizQuestionRequest> questions)
        {
            if (questions == null)
            {
                throw new ArgumentNullException(nameof(questions));
            }

            if (!questions.Any())
            {
                throw new ArgumentException("Questions collection cannot be empty", nameof(questions));
            }

            try
            {
                var today = DateTime.UtcNow.Date;
                var quizQuestions = questions.Select(q => new QuizQuestion
                {
                    Id = Guid.NewGuid(),
                    Question = q.Question,
                    Options = q.Options,
                    CorrectAnswer = q.CorrectAnswer,
                    ExampleSentence = q.ExampleSentence,
                    Type = q.Type,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }).ToList();

                var response = await _supabaseClient
                    .From<QuizQuestion>()
                    .Insert(quizQuestions);

                // Replace direct cache removal with CacheInvalidator
                await _cacheInvalidator.InvalidateQuizCacheAsync();

                _logger.LogInformation("Created {Count} quiz questions for {Date}", 
                    quizQuestions.Count, today.ToString("yyyy-MM-dd"));

                return _mapper.Map<IEnumerable<QuizQuestionResponse>>(response.Models);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating quiz questions");
                throw;
            }
        }

        /// <summary>
        /// Gets quiz questions by category.
        /// </summary>
        public async Task<IEnumerable<QuizQuestionResponse>> GetQuizQuestionsByCategoryAsync(string category)
        {
            if (string.IsNullOrWhiteSpace(category))
            {
                throw new ArgumentException("Category cannot be empty", nameof(category));
            }

            var cacheKey = $"{CacheKeyPrefix}category:{category.ToLowerInvariant()}";
            var cached = await _cache.GetAsync<IEnumerable<QuizQuestionResponse>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved quiz questions from cache for category {Category}", category);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<QuizQuestion>()
                    .Where(q => q.Type.ToString().ToLower() == category.ToLowerInvariant())
                    .Get();

                var questions = response.Models;
                var questionResponses = _mapper.Map<IEnumerable<QuizQuestionResponse>>(questions);

                await _cache.SetAsync(cacheKey, questionResponses,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} quiz questions for category {Category}", 
                    questions.Count, category);

                return questionResponses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving quiz questions for category {Category}", category);
                throw;
            }
        }
    }
}
