using Lithuaningo.API.Services.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http;
using Lithuaningo.API.Settings;
using Lithuaningo.API.DTOs.Flashcard;
using System.Text.Json.Serialization;
using AutoMapper;
using Lithuaningo.API.Models;
using static Supabase.Postgrest.Constants;
using Supabase.Postgrest;

namespace Lithuaningo.API.Services
{
    public class FlashcardService : IFlashcardService
    {
        private readonly ILogger<FlashcardService> _logger;
        private readonly IStorageService _storageService;
        private readonly IOptions<StorageSettings> _storageSettings;
        private readonly IAIService _aiService;
        private readonly ISupabaseService _supabaseService;
        private readonly IUserFlashcardStatService _userFlashcardStatService;
        private readonly IMapper _mapper;
        private readonly Random _random;

        private const double ShownFlashcardsRatio = 0.2; // 20% shown, 80% not shown
        
        public FlashcardService(
            IStorageService storageService,
            IOptions<StorageSettings> storageSettings,
            IAIService aiService,
            ISupabaseService supabaseService,
            IUserFlashcardStatService userFlashcardStatService,
            IMapper mapper,
            ILogger<FlashcardService> logger,
            Random random)
        {
            _storageService = storageService ?? throw new ArgumentNullException(nameof(storageService));
            _storageSettings = storageSettings ?? throw new ArgumentNullException(nameof(storageSettings));
            _aiService = aiService ?? throw new ArgumentNullException(nameof(aiService));
            _supabaseService = supabaseService ?? throw new ArgumentNullException(nameof(supabaseService));
            _userFlashcardStatService = userFlashcardStatService ?? throw new ArgumentNullException(nameof(userFlashcardStatService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _random = random ?? throw new ArgumentNullException(nameof(random));
        }

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
                    return await GenerateNewFlashcardsAsync(request);
                }
                
                // Get and separate shown/not-shown flashcards
                var shownFlashcardIds = await _userFlashcardStatService.GetShownFlashcardIdsAsync(userId);
                var (shownFlashcards, notShownFlashcards) = SeparateFlashcards(existingFlashcards, shownFlashcardIds);
                
                LogFlashcardCounts(existingFlashcards.Count, shownFlashcards.Count, notShownFlashcards.Count, request);
                
                // Select a mix of shown and not-shown flashcards
                var selectedFlashcards = SelectFlashcardMix(shownFlashcards, notShownFlashcards, request.Count);
                
                // Generate more if needed
                int remainingCount = request.Count - selectedFlashcards.Count;
                if (remainingCount > 0)
                {
                    return await AddNewFlashcardsAsync(selectedFlashcards, remainingCount, request);
                }
                
                // Process and return the selected flashcards
                await MarkNewlyShownFlashcardsAsync(selectedFlashcards, shownFlashcardIds, userId);
                return _mapper.Map<IEnumerable<FlashcardResponse>>(selectedFlashcards);
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

        public async Task<string> UploadFlashcardFileAsync(IFormFile file)
        {
            if (file == null)
            {
                throw new ArgumentNullException(nameof(file));
            }

            try
            {
                var subfolder = DetermineSubfolder(file.ContentType);
                return await _storageService.UploadFileAsync(
                    file,
                    _storageSettings.Value.Paths.Flashcards,
                    subfolder
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading flashcard file");
                throw;
            }
        }
        
        #region Helper Methods
        
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
        
        private (List<Flashcard> Shown, List<Flashcard> NotShown) SeparateFlashcards(
            List<Flashcard> allFlashcards, HashSet<Guid> shownFlashcardIds)
        {
            var shown = allFlashcards.Where(f => shownFlashcardIds.Contains(f.Id)).ToList();
            var notShown = allFlashcards.Where(f => !shownFlashcardIds.Contains(f.Id)).ToList();
            return (shown, notShown);
        }
        
        private void LogFlashcardCounts(int total, int shown, int notShown, FlashcardRequest request)
        {
            _logger.LogInformation(
                "Found {TotalCount} flashcards for category '{Category}' with difficulty '{Difficulty}' ({ShownCount} shown, {NotShownCount} not shown)", 
                total, request.PrimaryCategory, request.Difficulty, shown, notShown);
        }
        
        private List<Flashcard> SelectFlashcardMix(List<Flashcard> shown, List<Flashcard> notShown, int totalCount)
        {
            int shownCount = (int)Math.Ceiling(totalCount * ShownFlashcardsRatio);
            int notShownCount = totalCount - shownCount;
            
            var selectedFlashcards = new List<Flashcard>();
            
            // Add shuffled shown flashcards (up to 20%)
            if (shown.Any())
            {
                var shuffledShown = shown.OrderBy(_ => _random.Next()).ToList();
                selectedFlashcards.AddRange(shuffledShown.Take(shownCount));
            }
            
            // Add shuffled not-shown flashcards (up to 80%)
            if (notShown.Any())
            {
                var shuffledNotShown = notShown.OrderBy(_ => _random.Next()).ToList();
                selectedFlashcards.AddRange(shuffledNotShown.Take(notShownCount));
            }
            
            _logger.LogInformation(
                "Selected {ShownSelected} shown and {NotShownSelected} not-shown flashcards, need {RemainingCount} more", 
                Math.Min(shownCount, shown.Count),
                Math.Min(notShownCount, notShown.Count),
                totalCount - selectedFlashcards.Count);
                
            // Shuffle the final mix
            return selectedFlashcards.OrderBy(_ => _random.Next()).ToList();
        }
        
        private async Task<IEnumerable<FlashcardResponse>> AddNewFlashcardsAsync(
            List<Flashcard> selectedFlashcards, int remainingCount, FlashcardRequest request)
        {
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
        
        private async Task MarkNewlyShownFlashcardsAsync(
            List<Flashcard> flashcards, HashSet<Guid> alreadyShownIds, string userId)
        {
            var newlyShownFlashcards = flashcards
                .Where(f => !alreadyShownIds.Contains(f.Id))
                .ToList();
            
            if (newlyShownFlashcards.Any())
            {
                await _userFlashcardStatService.MarkFlashcardsAsShownAsync(newlyShownFlashcards, userId);
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
        
        private async Task<List<Flashcard>> GenerateUniqueFlashcardsAsync(
            FlashcardRequest request, List<string> randomWords, 
            HashSet<string> wordCategoryMap, int categoryValue)
        {
            var generatedFlashcards = await _aiService.GenerateFlashcardsAsync(request, randomWords);
            
            return generatedFlashcards
                .Where(f => !wordCategoryMap.Contains($"{f.FrontWord.ToLowerInvariant()}:{categoryValue}"))
                .ToList();
        }
        
        private async Task<IEnumerable<FlashcardResponse>> GenerateNewFlashcardsAsync(FlashcardRequest request)
        {
            _logger.LogInformation("Generating {Count} new flashcards for category '{Category}' with difficulty '{Difficulty}'",
                request.Count, request.PrimaryCategory, request.Difficulty);
            
            return await GenerateFlashcardsAsync(request);
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
        
        private string FormatHintMessage(string? hint)
        {
            return !string.IsNullOrEmpty(hint) ? $" and hint '{hint}'" : string.Empty;
        }
        
        private string DetermineSubfolder(string contentType)
        {
            return contentType.StartsWith("audio/")
                ? _storageSettings.Value.Paths.Audio
                : contentType.StartsWith("image/")
                    ? _storageSettings.Value.Paths.Images
                    : _storageSettings.Value.Paths.Other;
        }
        
        #endregion
    }
}
