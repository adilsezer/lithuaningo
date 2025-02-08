using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using Lithuaningo.API.DTOs.Flashcard;
using AutoMapper;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Controller for managing flashcards
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class FlashcardController : ControllerBase
    {
        private readonly IFlashcardService _flashcardService;
        private readonly IStorageService _storageService;
        private readonly IOptions<StorageSettings> _storageSettings;
        private readonly ILogger<FlashcardController> _logger;
        private readonly IMapper _mapper;

        public FlashcardController(
            IFlashcardService flashcardService,
            IStorageService storageService,
            IOptions<StorageSettings> storageSettings,
            ILogger<FlashcardController> logger,
            IMapper mapper)
        {
            _flashcardService = flashcardService ?? throw new ArgumentNullException(nameof(flashcardService));
            _storageService = storageService ?? throw new ArgumentNullException(nameof(storageService));
            _storageSettings = storageSettings ?? throw new ArgumentNullException(nameof(storageSettings));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        /// <summary>
        /// Gets a specific flashcard by ID
        /// </summary>
        /// <param name="id">The flashcard identifier</param>
        /// <returns>The requested flashcard</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<FlashcardResponse>> GetFlashcard(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Flashcard ID is empty");
                return BadRequest("Flashcard ID cannot be empty");
            }

            try
            {
                var flashcard = await _flashcardService.GetFlashcardByIdAsync(id);
                if (flashcard == null)
                {
                    return NotFound();
                }

                var response = _mapper.Map<FlashcardResponse>(flashcard);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving flashcard {FlashcardId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Gets all flashcards for a specific user
        /// </summary>
        /// <param name="userId">The user identifier</param>
        /// <returns>List of flashcards owned by the user</returns>
        [HttpGet("user/{userId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<FlashcardResponse>>> GetUserFlashcards(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("User ID is empty");
                return BadRequest("User ID cannot be empty");
            }

            try
            {
                var flashcards = await _flashcardService.GetUserFlashcardsAsync(userId);
                var response = _mapper.Map<List<FlashcardResponse>>(flashcards);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving flashcards for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Gets flashcards due for review
        /// </summary>
        /// <param name="userId">The user identifier</param>
        /// <param name="limit">Maximum number of flashcards to return</param>
        /// <returns>List of flashcards due for review</returns>
        [HttpGet("review/{userId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<FlashcardResponse>>> GetDueForReview(
            string userId,
            [FromQuery] int limit = 20)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("User ID is empty");
                return BadRequest("User ID cannot be empty");
            }

            if (limit <= 0 || limit > 100)
            {
                _logger.LogWarning("Invalid limit parameter: {Limit}", limit);
                return BadRequest("Limit must be between 1 and 100");
            }

            try
            {
                var flashcards = await _flashcardService.GetDueForReviewAsync(userId, limit);
                var response = _mapper.Map<List<FlashcardResponse>>(flashcards);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving flashcards due for review for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Creates a new flashcard
        /// </summary>
        /// <param name="request">The flashcard creation request</param>
        /// <returns>The created flashcard</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<FlashcardResponse>> CreateFlashcard([FromBody] CreateFlashcardRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var flashcard = _mapper.Map<Flashcard>(request);
                var flashcardId = await _flashcardService.CreateFlashcardAsync(flashcard);
                var createdFlashcard = await _flashcardService.GetFlashcardByIdAsync(flashcardId);
                var response = _mapper.Map<FlashcardResponse>(createdFlashcard);
                return CreatedAtAction(nameof(GetFlashcard), new { id = flashcardId }, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating flashcard for deck {DeckId}", request.DeckId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Updates an existing flashcard
        /// </summary>
        /// <param name="id">The flashcard identifier</param>
        /// <param name="request">The flashcard update request</param>
        /// <returns>The updated flashcard</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<FlashcardResponse>> UpdateFlashcard(
            string id,
            [FromBody] UpdateFlashcardRequest request)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Flashcard ID is empty");
                return BadRequest("Flashcard ID cannot be empty");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existingFlashcard = await _flashcardService.GetFlashcardByIdAsync(id);
                if (existingFlashcard == null)
                {
                    return NotFound();
                }

                var flashcard = _mapper.Map<Flashcard>(request);
                flashcard.Id = Guid.Parse(id);
                flashcard.DeckId = existingFlashcard.DeckId;
                flashcard.CreatedAt = existingFlashcard.CreatedAt;

                await _flashcardService.UpdateFlashcardAsync(id, flashcard);
                var updatedFlashcard = await _flashcardService.GetFlashcardByIdAsync(id);
                var response = _mapper.Map<FlashcardResponse>(updatedFlashcard);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating flashcard {FlashcardId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Deletes a flashcard
        /// </summary>
        /// <param name="id">The flashcard identifier</param>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteFlashcard(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Flashcard ID is empty");
                return BadRequest("Flashcard ID cannot be empty");
            }

            try
            {
                await _flashcardService.DeleteFlashcardAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting flashcard {FlashcardId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Updates the review status of a flashcard
        /// </summary>
        /// <param name="id">The flashcard identifier</param>
        /// <param name="request">The review update request</param>
        [HttpPost("{id}/review")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateReviewStatus(
            string id,
            [FromBody] UpdateReviewRequest request)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Flashcard ID is empty");
                return BadRequest("Flashcard ID cannot be empty");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _flashcardService.UpdateReviewStatusAsync(id, request.WasCorrect);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review status for flashcard {FlashcardId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Gets random flashcards
        /// </summary>
        /// <param name="limit">Maximum number of flashcards to return</param>
        /// <returns>List of random flashcards</returns>
        [HttpGet("random")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<FlashcardResponse>>> GetRandomFlashcards([FromQuery] int limit = 10)
        {
            if (limit <= 0 || limit > 100)
            {
                _logger.LogWarning("Invalid limit parameter: {Limit}", limit);
                return BadRequest("Limit must be between 1 and 100");
            }

            try
            {
                var flashcards = await _flashcardService.GetRandomFlashcardsAsync(limit);
                var response = _mapper.Map<List<FlashcardResponse>>(flashcards);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving random flashcards");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Searches for flashcards
        /// </summary>
        /// <param name="query">The search query</param>
        /// <returns>List of matching flashcards</returns>
        [HttpGet("search")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<FlashcardResponse>>> SearchFlashcards([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                _logger.LogWarning("Search query is empty");
                return BadRequest("Query cannot be empty");
            }

            try
            {
                var flashcards = await _flashcardService.SearchFlashcardsAsync(query);
                var response = _mapper.Map<List<FlashcardResponse>>(flashcards);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching flashcards with query: {Query}", query);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Uploads a file for a flashcard
        /// </summary>
        /// <param name="file">The file to upload</param>
        /// <returns>The URL of the uploaded file</returns>
        [HttpPost("upload")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<string>> UploadFlashcardFile(IFormFile file)
        {
            if (file == null)
            {
                _logger.LogWarning("No file provided for upload");
                return BadRequest("File is required");
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

                return Ok(url);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading flashcard file");
                return StatusCode(500, "Error uploading flashcard file");
            }
        }
    }
}
