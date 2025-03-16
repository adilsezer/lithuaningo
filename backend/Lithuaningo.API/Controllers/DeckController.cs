using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.DTOs.Deck;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Authorization;
using Lithuaningo.API.DTOs.Flashcard;
using Microsoft.AspNetCore.Http;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages deck operations including creation, retrieval, update, and deletion of flashcard decks.
    /// Also handles deck-related operations such as ratings, reports, and user-specific deck management.
    /// </summary>
    /// <remarks>
    /// This controller handles all deck-related functionality including:
    /// - Managing public and private decks
    /// - User-specific deck operations
    /// - Deck rating and reporting system
    /// - Deck search and filtering
    /// - Associated flashcard management
    /// 
    /// All operations support proper error handling and validation.
    /// </remarks>
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("Deck management endpoints")]
    public class DeckController : BaseApiController
    {
        private readonly IDeckService _deckService;
        private readonly ILogger<DeckController> _logger;

        public DeckController(
            IDeckService deckService,
            ILogger<DeckController> logger)
        {
            _deckService = deckService ?? throw new ArgumentNullException(nameof(deckService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Retrieves all public decks with optional limit and pagination.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Deck?limit=10&page=1
        /// 
        /// Returns a list of public decks, including:
        /// - Basic deck information
        /// - Creator details
        /// - Rating statistics
        /// - Flashcard count
        /// </remarks>
        /// <param name="limit">Optional maximum number of decks to return per page</param>
        /// <param name="page">Optional page number for pagination (1-based)</param>
        /// <returns>List of public decks</returns>
        /// <response code="200">Returns the list of public decks</response>
        /// <response code="400">If limit or page parameter is invalid</response>
        /// <response code="500">If there was an internal error while retrieving decks</response>
        [HttpGet]
        [SwaggerOperation(
            Summary = "Retrieves all public decks",
            Description = "Gets a list of all publicly available decks with optional limit and pagination",
            OperationId = "GetPublicDecks",
            Tags = new[] { "Deck" }
        )]
        [ProducesResponseType(typeof(List<DeckResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<DeckResponse>>> GetPublicDecks([FromQuery] int? limit = null, [FromQuery] int? page = null)
        {
            if (limit.HasValue && (limit <= 0 || limit > 100))
            {
                _logger.LogWarning("Invalid limit parameter: {Limit}", limit);
                return BadRequest("Limit must be between 1 and 100");
            }

            if (page.HasValue && page <= 0)
            {
                _logger.LogWarning("Invalid page parameter: {Page}", page);
                return BadRequest("Page must be greater than 0");
            }

            try
            {
                var decks = await _deckService.GetDecksAsync(null, limit, page);
                return Ok(decks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving public decks");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Retrieves a specific deck by its ID.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Deck/{id}
        /// 
        /// The response includes:
        /// - Complete deck information
        /// - Associated flashcards
        /// - Rating information
        /// - Creator details
        /// </remarks>
        /// <param name="id">The deck identifier</param>
        /// <returns>The requested deck</returns>
        /// <response code="200">Returns the requested deck</response>
        /// <response code="400">If deck ID is empty</response>
        /// <response code="404">If deck not found</response>
        /// <response code="500">If there was an internal error during retrieval</response>
        [HttpGet("{id}")]
        [SwaggerOperation(
            Summary = "Retrieves a specific deck",
            Description = "Gets detailed information about a specific deck",
            OperationId = "GetDeck",
            Tags = new[] { "Deck" }
        )]
        [ProducesResponseType(typeof(DeckResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DeckResponse>> GetDeck(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Deck ID is empty");
                return BadRequest("Deck ID cannot be empty");
            }

            try
            {
                var deck = await _deckService.GetDeckByIdAsync(id);
                if (deck == null)
                {
                    return NotFound();
                }
                return Ok(deck);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving deck {DeckId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Creates a new deck.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/Deck
        ///     {
        ///         "title": "Lithuanian Basics",
        ///         "description": "Essential phrases for beginners",
        ///         "isPublic": true,
        ///         "category": "Beginner",
        ///         "tags": ["basics", "phrases", "beginner"]
        ///     }
        /// </remarks>
        /// <param name="request">The deck creation request</param>
        /// <returns>The created deck</returns>
        /// <response code="201">Returns the newly created deck</response>
        /// <response code="400">If the request model is invalid</response>
        /// <response code="500">If there was an internal error during creation</response>
        [HttpPost]
        [SwaggerOperation(
            Summary = "Creates a new deck",
            Description = "Creates a new flashcard deck with the specified properties",
            OperationId = "CreateDeck",
            Tags = new[] { "Deck" }
        )]
        [ProducesResponseType(typeof(DeckResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DeckResponse>> CreateDeck([FromBody] CreateDeckRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var deck = await _deckService.CreateDeckAsync(request);
                return CreatedAtAction(nameof(GetDeck), new { id = deck.Id }, deck);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating deck");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Updates an existing deck.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     PUT /api/v1/Deck/{id}
        ///     {
        ///         "title": "Updated Lithuanian Basics",
        ///         "description": "Updated essential phrases for beginners",
        ///         "isPublic": true,
        ///         "category": "Beginner",
        ///         "tags": ["basics", "phrases", "beginner", "updated"]
        ///     }
        /// </remarks>
        /// <param name="id">The deck identifier</param>
        /// <param name="request">The deck update request</param>
        /// <returns>The updated deck</returns>
        /// <response code="200">Returns the updated deck</response>
        /// <response code="400">If deck ID is empty or model state is invalid</response>
        /// <response code="404">If deck not found</response>
        /// <response code="500">If there was an internal error during update</response>
        [HttpPut("{id}")]
        [SwaggerOperation(
            Summary = "Updates an existing deck",
            Description = "Updates a deck with the specified properties",
            OperationId = "UpdateDeck",
            Tags = new[] { "Deck" }
        )]
        [ProducesResponseType(typeof(DeckResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DeckResponse>> UpdateDeck(string id, [FromBody] UpdateDeckRequest request)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Deck ID is empty");
                return BadRequest("Deck ID cannot be empty");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var deck = await _deckService.UpdateDeckAsync(id, request);
                return Ok(deck);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Bad request when updating deck with ID: {Id}", id);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating deck {DeckId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Deletes a deck.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     DELETE /api/v1/Deck/{id}
        /// 
        /// This operation:
        /// - Permanently removes the deck
        /// - Deletes all associated flashcards
        /// - Removes all ratings and comments
        /// - Cannot be undone
        /// </remarks>
        /// <param name="id">The deck identifier</param>
        /// <response code="204">Deck successfully deleted</response>
        /// <response code="400">If deck ID is empty</response>
        /// <response code="500">If there was an internal error during deletion</response>
        [HttpDelete("{id}")]
        [SwaggerOperation(
            Summary = "Deletes a deck",
            Description = "Permanently removes a deck and all associated data",
            OperationId = "DeleteDeck",
            Tags = new[] { "Deck" }
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteDeck(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Deck ID is empty");
                return BadRequest("Deck ID cannot be empty");
            }

            try
            {
                await _deckService.DeleteDeckAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting deck {DeckId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Retrieves all decks for a specific user.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Deck/user/{userId}
        /// 
        /// Returns all decks (both public and private) owned by the specified user.
        /// Results include:
        /// - Deck details
        /// - Creation and update timestamps
        /// - Associated statistics
        /// </remarks>
        /// <param name="userId">The user identifier</param>
        /// <returns>List of decks owned by the user</returns>
        /// <response code="200">Returns the list of user's decks</response>
        /// <response code="400">If user ID is empty</response>
        /// <response code="500">If there was an internal error during retrieval</response>
        [HttpGet("user/{userId}")]
        [SwaggerOperation(
            Summary = "Retrieves user decks",
            Description = "Gets all decks owned by the specified user",
            OperationId = "GetUserDecks",
            Tags = new[] { "Deck" }
        )]
        [ProducesResponseType(typeof(List<DeckResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<DeckResponse>>> GetUserDecks(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("User ID is empty");
                return BadRequest("User ID cannot be empty");
            }

            try
            {
                var decks = await _deckService.GetUserDecksAsync(userId);
                return Ok(decks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving decks for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Retrieves top rated decks.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Deck/top-rated?limit=10&amp;timeRange=month
        /// 
        /// Time range options:
        /// - "week": Last 7 days
        /// - "month": Last 30 days
        /// - "year": Last 365 days
        /// - "all": All time
        /// </remarks>
        /// <param name="limit">Maximum number of decks to return (range: 1-100)</param>
        /// <param name="timeRange">Time range for ratings calculation</param>
        /// <returns>List of top rated decks</returns>
        /// <response code="200">Returns the list of top rated decks</response>
        /// <response code="400">If limit is out of range</response>
        /// <response code="500">If there was an internal error during retrieval</response>
        [HttpGet("top-rated")]
        [SwaggerOperation(
            Summary = "Retrieves top rated decks",
            Description = "Gets the highest rated decks within the specified time range",
            OperationId = "GetTopRatedDecks",
            Tags = new[] { "Deck" }
        )]
        [ProducesResponseType(typeof(List<DeckResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<DeckResponse>>> GetTopRatedDecks(
            [FromQuery] int limit = 10,
            [FromQuery] string timeRange = "all")
        {
            if (limit <= 0 || limit > 100)
            {
                _logger.LogWarning("Invalid limit parameter: {Limit}", limit);
                return BadRequest("Limit must be between 1 and 100");
            }

            try
            {
                var decks = await _deckService.GetTopRatedDecksAsync(limit, timeRange);
                return Ok(decks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving top-rated decks");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Searches for decks based on query and optional category.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Deck/search?query=basics&amp;category=beginner
        /// 
        /// Search includes:
        /// - Deck titles
        /// - Descriptions
        /// - Tags
        /// - Creator information
        /// </remarks>
        /// <param name="query">The search query</param>
        /// <param name="category">Optional category filter</param>
        /// <returns>List of matching decks</returns>
        /// <response code="200">Returns matching decks</response>
        /// <response code="400">If query is empty</response>
        /// <response code="500">If there was an internal error during search</response>
        [HttpGet("search")]
        [SwaggerOperation(
            Summary = "Searches decks",
            Description = "Searches for decks based on query text and optional category",
            OperationId = "SearchDecks",
            Tags = new[] { "Deck" }
        )]
        [ProducesResponseType(typeof(List<DeckResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<DeckResponse>>> SearchDecks(
            [FromQuery] string query,
            [FromQuery] string? category = null)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                _logger.LogWarning("Search query is empty");
                return BadRequest("Query cannot be empty");
            }

            try
            {
                var decks = await _deckService.SearchDecksAsync(query, category);
                return Ok(decks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching decks with query: {Query} and category: {Category}", query, category);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Retrieves all flashcards in a deck.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Deck/{deckId}/flashcards
        /// 
        /// Returns all flashcards associated with the deck, including:
        /// - Card content
        /// - Media attachments
        /// - Creation dates
        /// - Review statistics
        /// </remarks>
        /// <param name="deckId">The deck identifier</param>
        /// <returns>List of flashcards in the deck</returns>
        /// <response code="200">Returns the list of flashcards</response>
        /// <response code="400">If deck ID format is invalid</response>
        /// <response code="500">If there was an internal error during retrieval</response>
        [HttpGet("{deckId}/flashcards")]
        [SwaggerOperation(
            Summary = "Retrieves deck flashcards",
            Description = "Gets all flashcards associated with a specific deck",
            OperationId = "GetDeckFlashcards",
            Tags = new[] { "Deck" }
        )]
        [ProducesResponseType(typeof(List<FlashcardResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<FlashcardResponse>>> GetDeckFlashcards(string deckId)
        {
            if (!Guid.TryParse(deckId, out _))
            {
                _logger.LogWarning("Invalid deck ID format for flashcards: {DeckId}", deckId);
                return BadRequest("Invalid deck ID format");
            }

            try
            {
                var flashcards = await _deckService.GetDeckFlashcardsAsync(deckId);
                return Ok(flashcards);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving flashcards for deck {DeckId}", deckId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Uploads a file (image) for a deck.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/Deck/upload
        /// 
        /// The request should be a multipart/form-data with a single file.
        /// Supported file types: image/jpeg, image/png, image/gif
        /// Maximum file size: 5MB
        /// </remarks>
        /// <param name="file">The file to upload</param>
        /// <returns>The URL of the uploaded file</returns>
        /// <response code="200">Returns the URL of the uploaded file</response>
        /// <response code="400">If file is invalid or missing</response>
        /// <response code="500">If there was an internal error during upload</response>
        [HttpPost("upload")]
        [SwaggerOperation(
            Summary = "Uploads a deck image",
            Description = "Uploads an image file for a deck",
            OperationId = "UploadDeckImage",
            Tags = new[] { "Deck" }
        )]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<string>> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                _logger.LogWarning("[DeckController.UploadFile] No file uploaded or empty file");
                return BadRequest("No file uploaded");
            }

            _logger.LogInformation(
                "[DeckController.UploadFile] Starting file upload: {FileName}, Type: {ContentType}, Size: {Size}KB",
                file.FileName,
                file.ContentType,
                file.Length / 1024
            );

            if (!file.ContentType.StartsWith("image/"))
            {
                _logger.LogWarning(
                    "[DeckController.UploadFile] Invalid file type: {ContentType} for file {FileName}",
                    file.ContentType,
                    file.FileName
                );
                return BadRequest("Only image files are allowed");
            }

            if (file.Length > 5 * 1024 * 1024) // 5MB limit
            {
                _logger.LogWarning(
                    "[DeckController.UploadFile] File too large: {Size}KB for file {FileName}",
                    file.Length / 1024,
                    file.FileName
                );
                return BadRequest("File size must not exceed 5MB");
            }

            try
            {
                var url = await _deckService.UploadDeckImageAsync(file);
                _logger.LogInformation(
                    "[DeckController.UploadFile] File uploaded successfully: {FileName}, URL: {Url}",
                    file.FileName,
                    url
                );
                return Ok(url);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "[DeckController.UploadFile] Error uploading file: {FileName}, Type: {ContentType}, Size: {Size}KB",
                    file.FileName,
                    file.ContentType,
                    file.Length / 1024
                );
                return StatusCode(500, "Error uploading deck image");
            }
        }
    }
}
