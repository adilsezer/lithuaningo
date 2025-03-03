using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using Lithuaningo.API.DTOs.Flashcard;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Authorization;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages flashcard operations including creation, retrieval, update, and deletion.
    /// Also handles flashcard-specific features like review scheduling, file attachments,
    /// and search functionality.
    /// </summary>
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("Flashcard management endpoints")]
    public class FlashcardController : BaseApiController
    {
        private readonly IFlashcardService _flashcardService;
        private readonly IStorageService _storageService;
        private readonly IOptions<StorageSettings> _storageSettings;
        private readonly ILogger<FlashcardController> _logger;

        public FlashcardController(
            IFlashcardService flashcardService,
            IStorageService storageService,
            IOptions<StorageSettings> storageSettings,
            ILogger<FlashcardController> logger)
        {
            _flashcardService = flashcardService ?? throw new ArgumentNullException(nameof(flashcardService));
            _storageService = storageService ?? throw new ArgumentNullException(nameof(storageService));
            _storageSettings = storageSettings ?? throw new ArgumentNullException(nameof(storageSettings));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Retrieves a specific flashcard by its ID.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Flashcard/{id}
        /// 
        /// The response includes:
        /// - Front and back content
        /// - Associated media URLs
        /// - Creation and update timestamps
        /// - Review statistics
        /// </remarks>
        /// <param name="id">The flashcard identifier</param>
        /// <returns>The requested flashcard</returns>
        /// <response code="200">Returns the flashcard</response>
        /// <response code="400">If flashcard ID is empty</response>
        /// <response code="404">If flashcard not found</response>
        /// <response code="500">If there was an internal error during retrieval</response>
        [HttpGet("{id}")]
        [SwaggerOperation(
            Summary = "Retrieves a flashcard",
            Description = "Gets detailed information about a specific flashcard",
            OperationId = "GetFlashcard",
            Tags = new[] { "Flashcard" }
        )]
        [ProducesResponseType(typeof(FlashcardResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
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

                return Ok(flashcard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving flashcard {FlashcardId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Creates a new flashcard.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/Flashcard
        ///     {
        ///         "deckId": "deck-guid",
        ///         "front": "Labas",
        ///         "back": "Hello",
        ///         "frontImageUrl": "https://storage.url/image.jpg",
        ///         "frontAudioUrl": "https://storage.url/audio.mp3",
        ///         "tags": ["greeting", "basic"]
        ///     }
        /// </remarks>
        /// <param name="request">The flashcard creation request</param>
        /// <returns>The created flashcard</returns>
        /// <response code="201">Returns the newly created flashcard</response>
        /// <response code="400">If the request model is invalid</response>
        /// <response code="500">If there was an internal error during creation</response>
        [HttpPost]
        [SwaggerOperation(
            Summary = "Creates a new flashcard",
            Description = "Creates a new flashcard with the specified properties",
            OperationId = "CreateFlashcard",
            Tags = new[] { "Flashcard" }
        )]
        [ProducesResponseType(typeof(FlashcardResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<FlashcardResponse>> CreateFlashcard([FromBody] CreateFlashcardRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var flashcardId = await _flashcardService.CreateFlashcardAsync(request);
                var createdFlashcard = await _flashcardService.GetFlashcardByIdAsync(flashcardId);
                return CreatedAtAction(nameof(GetFlashcard), new { id = flashcardId }, createdFlashcard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating flashcard for deck {DeckId}", request.DeckId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Updates an existing flashcard.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     PUT /api/v1/Flashcard/{id}
        ///     {
        ///         "front": "Updated Labas",
        ///         "back": "Updated Hello",
        ///         "frontImageUrl": "https://storage.url/new-image.jpg",
        ///         "frontAudioUrl": "https://storage.url/new-audio.mp3",
        ///         "tags": ["greeting", "basic", "updated"]
        ///     }
        /// </remarks>
        /// <param name="id">The flashcard identifier</param>
        /// <param name="request">The flashcard update request</param>
        /// <returns>The updated flashcard</returns>
        /// <response code="200">Returns the updated flashcard</response>
        /// <response code="400">If flashcard ID is empty or model state is invalid</response>
        /// <response code="404">If flashcard not found</response>
        /// <response code="500">If there was an internal error during update</response>
        [HttpPut("{id}")]
        [SwaggerOperation(
            Summary = "Updates a flashcard",
            Description = "Updates an existing flashcard with new content",
            OperationId = "UpdateFlashcard",
            Tags = new[] { "Flashcard" }
        )]
        [ProducesResponseType(typeof(FlashcardResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
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

                var updatedFlashcard = await _flashcardService.UpdateFlashcardAsync(id, request);
                return Ok(updatedFlashcard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating flashcard {FlashcardId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Deletes a flashcard.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     DELETE /api/v1/Flashcard/{id}
        /// 
        /// This operation:
        /// - Permanently removes the flashcard
        /// - Deletes associated media files
        /// - Updates deck statistics
        /// - Cannot be undone
        /// </remarks>
        /// <param name="id">The flashcard identifier</param>
        /// <response code="204">Flashcard successfully deleted</response>
        /// <response code="400">If flashcard ID is empty</response>
        /// <response code="500">If there was an internal error during deletion</response>
        [HttpDelete("{id}")]
        [SwaggerOperation(
            Summary = "Deletes a flashcard",
            Description = "Permanently removes a flashcard and its associated data",
            OperationId = "DeleteFlashcard",
            Tags = new[] { "Flashcard" }
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
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
        /// Retrieves random flashcards.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Flashcard/random?limit=10
        /// 
        /// Returns a random selection of flashcards:
        /// - From public decks only
        /// - Not previously seen by the user
        /// - Suitable for discovery and exploration
        /// </remarks>
        /// <param name="limit">Maximum number of flashcards (range: 1-100, default: 10)</param>
        /// <returns>List of random flashcards</returns>
        /// <response code="200">Returns the list of random flashcards</response>
        /// <response code="400">If limit is invalid</response>
        /// <response code="500">If there was an internal error during retrieval</response>
        [HttpGet("random")]
        [SwaggerOperation(
            Summary = "Retrieves random flashcards",
            Description = "Gets a random selection of flashcards for exploration",
            OperationId = "GetRandomFlashcards",
            Tags = new[] { "Flashcard" }
        )]
        [ProducesResponseType(typeof(List<FlashcardResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
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
                return Ok(flashcards);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving random flashcards");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Searches for flashcards.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Flashcard/search?query=hello
        /// 
        /// Searches across:
        /// - Front content
        /// - Back content
        /// - Tags
        /// - Associated metadata
        /// </remarks>
        /// <param name="query">The search query</param>
        /// <returns>List of matching flashcards</returns>
        /// <response code="200">Returns matching flashcards</response>
        /// <response code="400">If query is empty</response>
        /// <response code="500">If there was an internal error during search</response>
        [HttpGet("search")]
        [SwaggerOperation(
            Summary = "Searches flashcards",
            Description = "Searches for flashcards based on content and metadata",
            OperationId = "SearchFlashcards",
            Tags = new[] { "Flashcard" }
        )]
        [ProducesResponseType(typeof(List<FlashcardResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
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
                return Ok(flashcards);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching flashcards with query: {Query}", query);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Uploads a file for a flashcard.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/Flashcard/upload
        /// 
        /// The request should be a multipart/form-data request with a file field.
        /// Supported file types:
        /// - Images (jpg, png, gif)
        /// - Audio (mp3, wav)
        /// 
        /// Maximum file sizes:
        /// - Images: 5MB
        /// - Audio: 10MB
        /// </remarks>
        /// <param name="file">The file to upload</param>
        /// <returns>The URL of the uploaded file</returns>
        /// <response code="200">Returns the URL of the uploaded file</response>
        /// <response code="400">If file is missing or invalid</response>
        /// <response code="500">If there was an internal error during upload</response>
        [HttpPost("upload")]
        [SwaggerOperation(
            Summary = "Uploads a file",
            Description = "Uploads an image or audio file for a flashcard",
            OperationId = "UploadFlashcardFile",
            Tags = new[] { "Flashcard" }
        )]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<string>> UploadFlashcardFile(IFormFile file)
        {
            if (file == null)
            {
                _logger.LogWarning("No file provided for upload");
                return BadRequest("File is required");
            }

            try
            {
                var url = await _flashcardService.UploadFlashcardFileAsync(file);
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
