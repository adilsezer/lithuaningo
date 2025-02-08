using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.DTOs.Deck;
using AutoMapper;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Controller for managing decks
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class DeckController : ControllerBase
    {
        private readonly IDeckService _deckService;
        private readonly ILogger<DeckController> _logger;
        private readonly IMapper _mapper;

        public DeckController(
            IDeckService deckService,
            ILogger<DeckController> logger,
            IMapper mapper)
        {
            _deckService = deckService ?? throw new ArgumentNullException(nameof(deckService));
            _logger = logger;
            _mapper = mapper;
        }

        /// <summary>
        /// Gets all public decks
        /// </summary>
        /// <returns>List of public decks</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<DeckResponse>>> GetPublicDecks()
        {
            try
            {
                var decks = await _deckService.GetDecksAsync();
                var response = _mapper.Map<List<DeckResponse>>(decks);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving public decks");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Gets a specific deck by ID
        /// </summary>
        /// <param name="id">The deck identifier</param>
        /// <returns>The requested deck</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
                var response = _mapper.Map<DeckResponse>(deck);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving deck {DeckId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Creates a new deck
        /// </summary>
        /// <param name="request">The deck creation request</param>
        /// <returns>The created deck</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DeckResponse>> CreateDeck([FromBody] CreateDeckRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var deck = _mapper.Map<Deck>(request);
                var deckId = await _deckService.CreateDeckAsync(deck);
                var createdDeck = await _deckService.GetDeckByIdAsync(deckId);
                var response = _mapper.Map<DeckResponse>(createdDeck);
                return CreatedAtAction(nameof(GetDeck), new { id = response.Id }, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating deck");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Updates an existing deck
        /// </summary>
        /// <param name="id">The deck identifier</param>
        /// <param name="request">The deck update request</param>
        /// <returns>The updated deck</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
                var deck = _mapper.Map<Deck>(request);
                deck.Id = Guid.Parse(id);
                await _deckService.UpdateDeckAsync(id, deck);
                var updatedDeck = await _deckService.GetDeckByIdAsync(id);
                if (updatedDeck == null)
                {
                    return NotFound();
                }
                var response = _mapper.Map<DeckResponse>(updatedDeck);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating deck {DeckId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Deletes a deck
        /// </summary>
        /// <param name="id">The deck identifier</param>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
        /// Gets all decks for a specific user
        /// </summary>
        /// <param name="userId">The user identifier</param>
        /// <returns>List of decks owned by the user</returns>
        [HttpGet("user/{userId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
                var response = _mapper.Map<List<DeckResponse>>(decks);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving decks for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Gets top rated decks
        /// </summary>
        /// <param name="limit">Maximum number of decks to return</param>
        /// <param name="timeRange">Time range for ratings (e.g., "week", "month", "all")</param>
        /// <returns>List of top rated decks</returns>
        [HttpGet("top-rated")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
                var response = _mapper.Map<List<DeckResponse>>(decks);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving top-rated decks");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Votes on a deck
        /// </summary>
        /// <param name="id">The deck identifier</param>
        /// <param name="userId">The user identifier</param>
        /// <param name="isUpvote">Whether the vote is positive</param>
        /// <returns>Whether the vote was successful</returns>
        [HttpPost("{id}/vote")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<bool>> VoteDeck(
            string id,
            [FromQuery] string userId,
            [FromQuery] bool isUpvote)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Deck ID is empty");
                return BadRequest("Deck ID cannot be empty");
            }

            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("User ID is empty");
                return BadRequest("User ID cannot be empty");
            }

            try
            {
                var result = await _deckService.VoteDeckAsync(id, userId, isUpvote);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error voting on deck {DeckId} by user {UserId}", id, userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Reports a deck for inappropriate content
        /// </summary>
        /// <param name="id">The deck identifier</param>
        /// <param name="userId">The user identifier</param>
        /// <param name="reason">The reason for reporting</param>
        [HttpPost("{id}/report")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ReportDeck(
            string id,
            [FromQuery] string userId,
            [FromBody] string reason)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Deck ID is empty");
                return BadRequest("Deck ID cannot be empty");
            }

            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("User ID is empty");
                return BadRequest("User ID cannot be empty");
            }

            if (string.IsNullOrWhiteSpace(reason))
            {
                _logger.LogWarning("Report reason is empty");
                return BadRequest("Report reason cannot be empty");
            }

            try
            {
                await _deckService.ReportDeckAsync(id, userId, reason);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reporting deck {DeckId} by user {UserId}", id, userId);
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/Deck/search?query={query}&category={category}
        [HttpGet("search")]
        public async Task<ActionResult<List<Deck>>> SearchDecks([FromQuery] string query, [FromQuery] string? category = null)
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

        // GET: api/Deck/{deckId}/flashcards
        [HttpGet("{deckId}/flashcards")]
        public async Task<ActionResult<List<Flashcard>>> GetDeckFlashcards(string deckId)
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

        // GET: api/Deck/{id}/rating?timeRange={timeRange}
        [HttpGet("{id}/rating")]
        public async Task<ActionResult<double>> GetDeckRating(string id, [FromQuery] string timeRange = "all")
        {
            if (!Guid.TryParse(id, out _))
            {
                _logger.LogWarning("Invalid deck ID format for rating: {Id}", id);
                return BadRequest("Invalid deck ID format");
            }
            try
            {
                var rating = await _deckService.GetDeckRatingAsync(id, timeRange);
                return Ok(rating);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving rating for deck {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
