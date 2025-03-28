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
using Lithuaningo.API.DTOs.Flashcard;
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
        private readonly IFlashcardService _flashcardService;
        public ChallengeService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<ChallengeService> logger,
            IMapper mapper,
            CacheInvalidator cacheInvalidator,
            IAIService aiService,
            IFlashcardService flashcardService)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger;
            _mapper = mapper;
            _cacheInvalidator = cacheInvalidator;
            _aiService = aiService;
            _flashcardService = flashcardService;
        }

        /// <summary>
        /// Generates new challenge questions using AI without checking if questions already exist.
        /// </summary>
        public async Task<IEnumerable<ChallengeQuestionResponse>> GenerateAIChallengeQuestionsAsync(CreateChallengeRequest request)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }
            
            try
            {
                _logger.LogInformation("Generating challenge questions using AI service");
                
                // Generate challenges using AI
                var questions = await _aiService.GenerateChallengesAsync(request);
                    
                return questions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating AI challenge questions");
                throw;
            }
        }

    }
}
