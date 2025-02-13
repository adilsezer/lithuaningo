using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.DTOs.UserFlashcardStats;
using AutoMapper;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Authorization;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages flashcard statistics including review history, success rates, and learning progress.
    /// Provides endpoints for tracking and analyzing user performance with flashcards.
    /// </summary>
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("Flashcard statistics management endpoints")]
    public class UserFlashcardStatsController : BaseApiController
    {
        private readonly IUserFlashcardStatsService _userFlashcardStatsService;
        private readonly ILogger<UserFlashcardStatsController> _logger;
        private readonly IMapper _mapper;

        public UserFlashcardStatsController(
            IUserFlashcardStatsService userFlashcardStatsService,
            ILogger<UserFlashcardStatsController> logger,
            IMapper mapper)
        {
            _userFlashcardStatsService = userFlashcardStatsService ?? throw new ArgumentNullException(nameof(userFlashcardStatsService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        /// <summary>
        /// Retrieves flashcard statistics for a specific deck and user.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/UserFlashcardStats/{deckId}/stats?userId=user-guid
        /// 
        /// The response includes:
        /// - Total reviews count
        /// - Success rate percentage
        /// - Last review timestamp
        /// - Average response time
        /// - Difficulty rating
        /// </remarks>
        /// <param name="deckId">The deck identifier</param>
        /// <param name="userId">The user identifier</param>
        /// <returns>Flashcard statistics for the specified deck and user</returns>
        /// <response code="200">Returns the flashcard statistics</response>
        /// <response code="400">If deck ID or user ID is empty</response>
        /// <response code="500">If there was an internal error during retrieval</response>
        [HttpGet("{deckId}/stats")]
        [SwaggerOperation(
            Summary = "Retrieves flashcard statistics",
            Description = "Gets detailed statistics for a specific deck and user",
            OperationId = "GetUserFlashcardStats",
            Tags = new[] { "UserFlashcardStats" }
        )]
        [ProducesResponseType(typeof(UserFlashcardStatsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserFlashcardStatsResponse>> GetUserFlashcardStats(string deckId, [FromQuery] string userId)
        {
            if (string.IsNullOrWhiteSpace(deckId) || string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("DeckId or UserId is missing");
                return BadRequest("DeckId and UserId are required");
            }

            try
            {
                var stats = await _userFlashcardStatsService.GetUserFlashcardStatsAsync(deckId, userId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching flashcard stats for deck {DeckId} and user {UserId}", deckId, userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Tracks progress for a flashcard review.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/UserFlashcardStats/{deckId}/track
        ///     {
        ///         "flashcardId": "flashcard-guid",
        ///         "userId": "user-guid",
        ///         "isCorrect": true,
        ///         "confidenceLevel": 3,
        ///         "timeTakenSeconds": 15
        ///     }
        /// </remarks>
        /// <param name="deckId">The deck identifier</param>
        /// <param name="request">The progress tracking request</param>
        /// <response code="204">Progress tracked successfully</response>
        /// <response code="400">If request is invalid</response>
        /// <response code="500">If there was an internal error during tracking</response>
        [HttpPost("{deckId}/track")]
        [SwaggerOperation(
            Summary = "Tracks flashcard progress",
            Description = "Records progress for a flashcard review session",
            OperationId = "TrackProgress",
            Tags = new[] { "UserFlashcardStats" }
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
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
                var stats = _mapper.Map<UserFlashcardStats>(request);
                await _userFlashcardStatsService.TrackUserFlashcardStatsAsync(
                    deckId,
                    stats.UserId.ToString(),
                    request.FlashcardId,
                    request.IsCorrect,
                    request.ConfidenceLevel,
                    request.TimeTakenSeconds);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error tracking flashcard stats for deck {DeckId}, flashcard {FlashcardId}", deckId, request.FlashcardId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Retrieves flashcard review history for a user.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/UserFlashcardStats/user/{userId}/history
        /// 
        /// Returns a chronological list of reviews including:
        /// - Review timestamp
        /// - Success/failure status
        /// - Response time
        /// - Associated flashcard details
        /// </remarks>
        /// <param name="userId">The user identifier</param>
        /// <returns>List of flashcard statistics for the user</returns>
        /// <response code="200">Returns the user's flashcard history</response>
        /// <response code="400">If user ID is empty</response>
        /// <response code="500">If there was an internal error during retrieval</response>
        [HttpGet("user/{userId}/history")]
        [SwaggerOperation(
            Summary = "Retrieves user's flashcard history",
            Description = "Gets the review history for all flashcards reviewed by a user",
            OperationId = "GetUserFlashcardHistory",
            Tags = new[] { "UserFlashcardStats" }
        )]
        [ProducesResponseType(typeof(List<UserFlashcardStatsResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<UserFlashcardStatsResponse>>> GetUserFlashcardHistory(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("UserId is missing");
                return BadRequest("UserId is required");
            }

            try
            {
                var history = await _userFlashcardStatsService.GetUserFlashcardHistoryAsync(userId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching flashcard history for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
