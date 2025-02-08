using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.DTOs.FlashcardStats;
using AutoMapper;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Controller for managing flashcard statistics
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class FlashcardStatsController : ControllerBase
    {
        private readonly IFlashcardStatsService _flashcardStatsService;
        private readonly ILogger<FlashcardStatsController> _logger;
        private readonly IMapper _mapper;

        public FlashcardStatsController(
            IFlashcardStatsService flashcardStatsService,
            ILogger<FlashcardStatsController> logger,
            IMapper mapper)
        {
            _flashcardStatsService = flashcardStatsService ?? throw new ArgumentNullException(nameof(flashcardStatsService));
            _logger = logger;
            _mapper = mapper;
        }

        /// <summary>
        /// Gets flashcard statistics for a specific deck and user
        /// </summary>
        /// <param name="deckId">The deck identifier</param>
        /// <param name="userId">The user identifier</param>
        /// <returns>Flashcard statistics for the specified deck and user</returns>
        [HttpGet("{deckId}/stats")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<FlashcardStatsResponse>> GetFlashcardStats(string deckId, [FromQuery] string userId)
        {
            if (string.IsNullOrWhiteSpace(deckId) || string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("DeckId or UserId is missing");
                return BadRequest("DeckId and UserId are required");
            }

            try
            {
                var stats = await _flashcardStatsService.GetFlashcardStatsAsync(deckId, userId);
                var response = _mapper.Map<FlashcardStatsResponse>(stats);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching flashcard stats for deck {DeckId} and user {UserId}", deckId, userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Tracks progress for a flashcard review
        /// </summary>
        /// <param name="deckId">The deck identifier</param>
        /// <param name="request">The progress tracking request</param>
        [HttpPost("{deckId}/track")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> TrackProgress(string deckId, [FromBody] TrackProgressRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.FlashcardId))
            {
                _logger.LogWarning("FlashcardId is missing");
                return BadRequest("FlashcardId is required");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var stats = _mapper.Map<FlashcardStats>(request);
                await _flashcardStatsService.TrackFlashcardStatsAsync(deckId, stats.UserId.ToString(), request.FlashcardId, request.IsCorrect);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error tracking flashcard stats for deck {DeckId}, flashcard {FlashcardId}", deckId, request.FlashcardId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Gets flashcard history for a user
        /// </summary>
        /// <param name="userId">The user identifier</param>
        /// <returns>List of flashcard statistics for the user</returns>
        [HttpGet("user/{userId}/history")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<FlashcardStatsResponse>>> GetFlashcardHistory(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("UserId is missing");
                return BadRequest("UserId is required");
            }

            try
            {
                var history = await _flashcardStatsService.GetUserFlashcardHistoryAsync(userId);
                var response = _mapper.Map<List<FlashcardStatsResponse>>(history);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching flashcard history for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
