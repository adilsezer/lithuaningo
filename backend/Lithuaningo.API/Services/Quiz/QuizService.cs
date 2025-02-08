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

        public QuizService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<QuizService> logger)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Retrieves quiz questions for the current day from Supabase.
        /// </summary>
        public async Task<IEnumerable<QuizQuestion>> GetDailyQuizQuestionsAsync()
        {
            var today = DateTime.UtcNow.Date.ToString("yyyy-MM-dd");
            var cacheKey = $"{CacheKeyPrefix}daily:{today}";
            var cached = await _cache.GetAsync<IEnumerable<QuizQuestion>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved daily quiz questions from cache for {Date}", today);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<QuizQuestion>()
                    .Filter("quiz_date", Operator.Equals, today)
                    .Get();

                var questions = response.Models;

                await _cache.SetAsync(cacheKey, questions,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} quiz questions for {Date}", 
                    questions.Count, today);

                return questions;
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
        public async Task CreateDailyQuizQuestionsAsync(IEnumerable<QuizQuestion> questions)
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
                    Explanation = q.Explanation,
                    Category = q.Category,
                    DifficultyLevel = q.DifficultyLevel,
                    QuizDate = today,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }).ToList();

                var response = await _supabaseClient
                    .From<QuizQuestion>()
                    .Insert(quizQuestions);

                // Invalidate the cache for today's questions
                var cacheKey = $"{CacheKeyPrefix}daily:{today:yyyy-MM-dd}";
                await _cache.RemoveAsync(cacheKey);

                _logger.LogInformation("Created {Count} quiz questions for {Date}", 
                    quizQuestions.Count, today.ToString("yyyy-MM-dd"));
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
        public async Task<IEnumerable<QuizQuestion>> GetQuizQuestionsByCategoryAsync(string category)
        {
            if (string.IsNullOrWhiteSpace(category))
            {
                throw new ArgumentException("Category cannot be empty", nameof(category));
            }

            var cacheKey = $"{CacheKeyPrefix}category:{category.ToLowerInvariant()}";
            var cached = await _cache.GetAsync<IEnumerable<QuizQuestion>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved quiz questions from cache for category {Category}", category);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<QuizQuestion>()
                    .Filter("category", Operator.Equals, category.ToLowerInvariant())
                    .Get();

                var questions = response.Models;

                await _cache.SetAsync(cacheKey, questions,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} quiz questions for category {Category}", 
                    questions.Count, category);

                return questions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving quiz questions for category {Category}", category);
                throw;
            }
        }

        /// <summary>
        /// Gets quiz questions by difficulty level.
        /// </summary>
        public async Task<IEnumerable<QuizQuestion>> GetQuizQuestionsByDifficultyAsync(int difficultyLevel)
        {
            if (difficultyLevel < 1 || difficultyLevel > 5)
            {
                throw new ArgumentException("Difficulty level must be between 1 and 5", nameof(difficultyLevel));
            }

            var cacheKey = $"{CacheKeyPrefix}difficulty:{difficultyLevel}";
            var cached = await _cache.GetAsync<IEnumerable<QuizQuestion>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved quiz questions from cache for difficulty level {Level}", 
                    difficultyLevel);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<QuizQuestion>()
                    .Filter("difficulty_level", Operator.Equals, difficultyLevel)
                    .Get();

                var questions = response.Models;

                await _cache.SetAsync(cacheKey, questions,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} quiz questions for difficulty level {Level}", 
                    questions.Count, difficultyLevel);

                return questions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving quiz questions for difficulty level {Level}", 
                    difficultyLevel);
                throw;
            }
        }
    }
}
