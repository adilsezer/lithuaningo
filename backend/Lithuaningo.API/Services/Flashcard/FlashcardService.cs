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

namespace Lithuaningo.API.Services
{
    public class FlashcardService : IFlashcardService
    {
        private readonly ILogger<FlashcardService> _logger;
        private readonly IStorageService _storageService;
        private readonly IOptions<StorageSettings> _storageSettings;
        private readonly IAIService _aiService;

        public FlashcardService(
            IStorageService storageService,
            IOptions<StorageSettings> storageSettings,
            IAIService aiService,
            ILogger<FlashcardService> logger)
        {
            _storageService = storageService ?? throw new ArgumentNullException(nameof(storageService));
            _storageSettings = storageSettings ?? throw new ArgumentNullException(nameof(storageSettings));
            _aiService = aiService ?? throw new ArgumentNullException(nameof(aiService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<string> UploadFlashcardFileAsync(IFormFile file)
        {
            if (file == null)
            {
                throw new ArgumentNullException(nameof(file));
            }

            try
            {
                var subfolder = file.ContentType.StartsWith("audio/")
                    ? _storageSettings.Value.Paths.Audio
                    : file.ContentType.StartsWith("image/")
                        ? _storageSettings.Value.Paths.Images
                        : _storageSettings.Value.Paths.Other;

                var url = await _storageService.UploadFileAsync(
                    file,
                    _storageSettings.Value.Paths.Flashcards,
                    subfolder
                );

                return url;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading flashcard file");
                throw;
            }
        }
        
        /// <summary>
        /// Generates flashcards using AI based on provided parameters without saving them
        /// </summary>
        /// <param name="request">Parameters for flashcard generation</param>
        /// <returns>A list of generated flashcards</returns>
        public async Task<IEnumerable<FlashcardResponse>> GenerateFlashcardsAsync(CreateFlashcardRequest request)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }
            
            try
            {
                _logger.LogInformation("Generating flashcards with AI for description '{Description}'", request.Description);
                
                // Get generated flashcards from the AI service
                var flashcards = await _aiService.GenerateFlashcardsAsync(request);
                
                return flashcards;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating flashcards for description '{Description}'", request.Description);
                throw;
            }
        }
    }
}
