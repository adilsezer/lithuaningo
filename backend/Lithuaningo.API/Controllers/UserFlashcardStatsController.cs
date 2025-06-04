using System.Security.Claims;
using FluentValidation;
using Lithuaningo.API.Authorization;
using Lithuaningo.API.DTOs.UserFlashcardStats;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Stats;
using Lithuaningo.API.Utilities;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages user statistics for flashcards, including tracking views, correct/incorrect answers, and mastery levels.
    /// </summary>
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("User Flashcard Statistics management endpoints")]
    public class UserFlashcardStatsController : BaseApiController
    {
        private readonly IUserFlashcardStatService _userFlashcardStatService;
        private readonly ILogger<UserFlashcardStatsController> _logger;

        public UserFlashcardStatsController(
            IUserFlashcardStatService userFlashcardStatService,
            ILogger<UserFlashcardStatsController> logger)
        {
            _userFlashcardStatService = userFlashcardStatService ?? throw new ArgumentNullException(nameof(userFlashcardStatService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets a summary of the user's flashcard statistics
        /// </summary>
        /// <param name="userId">The ID of the user to get stats for. If not provided, uses the authenticated user's ID.</param>
        /// <returns>A summary of the user's flashcard statistics</returns>
        /// <response code="200">Returns the user's flashcard statistics summary</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpGet("{userId}/summary-stats")]
        [SwaggerOperation(
            Summary = "Gets user flashcard statistics summary",
            Description = "Retrieves a summary of the user's flashcard usage and performance, including total counts, success rates, and mastery level distribution",
            OperationId = "GetUserFlashcardStatsSummary",
            Tags = new[] { "UserFlashcardStats" }
        )]
        [SwaggerResponse(StatusCodes.Status200OK, "The user's flashcard statistics summary was successfully retrieved", typeof(UserFlashcardStatsSummaryResponse))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "User is not authenticated")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "An error occurred while processing the request")]
        [ProducesResponseType(typeof(UserFlashcardStatsSummaryResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserFlashcardStatsSummaryResponse>> GetUserFlashcardStatsSummary(string userId)
        {
            try
            {
                // Use provided userId for development/testing, otherwise use authenticated user's ID
                var effectiveUserId = userId ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(effectiveUserId))
                {
                    return Unauthorized();
                }

                var stats = await _userFlashcardStatService.GetUserFlashcardStatsSummaryAsync(effectiveUserId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting flashcard stats summary");
                return StatusCode(500, "An error occurred while retrieving flashcard stats summary");
            }
        }

        /// <summary>
        /// Updates the statistics for a flashcard after user review
        /// </summary>
        /// <remarks>
        /// Sample request:
        /// 
        ///     POST /api/v1/UserFlashcardStats/submit-answer
        ///     {
        ///         "flashcardId": "0000000-0000-0000-0000-0000000000",
        ///         "wasCorrect": true,
        ///         "userId": null
        ///     }
        /// 
        /// Notes:
        /// - FlashcardId must be a valid GUID of an existing flashcard
        /// - WasCorrect indicates if the user answered the flashcard correctly
        /// - UserId can be left null (system will use the authenticated user's ID)
        /// </remarks>
        /// <param name="request">The request object containing the flashcard ID, correctness, and optional user ID</param>
        /// <returns>The updated user flashcard statistics</returns>
        /// <response code="200">Returns the updated flashcard statistics</response>
        /// <response code="400">If the request parameters are invalid</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpPost("submit-answer")]
        [SwaggerOperation(
            Summary = "Submits a flashcard answer",
            Description = "Submits a flashcard answer and automatically updates all relevant statistics including answer counts and mastery level",
            OperationId = "SubmitFlashcardAnswer",
            Tags = new[] { "UserFlashcardStats" }
        )]
        [SwaggerResponse(StatusCodes.Status200OK, "The flashcard statistics were successfully updated", typeof(UserFlashcardStatResponse))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Invalid input parameters")]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "User is not authenticated")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "An error occurred while processing the request")]
        [ProducesResponseType(typeof(UserFlashcardStatResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserFlashcardStatResponse>> SubmitFlashcardAnswer([FromBody] SubmitFlashcardAnswerRequest request)
        {
            try
            {
                // Use provided userId for development/testing, otherwise use authenticated user's ID
                var effectiveUserId = request.UserId ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(effectiveUserId))
                {
                    return Unauthorized();
                }

                var result = await _userFlashcardStatService.SubmitFlashcardAnswerAsync(
                    effectiveUserId,
                    request);

                return Ok(result);
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning(ex, "Validation failed for UpdateFlashcardStats request");
                return BadRequest(ex.Errors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating flashcard stats");
                return StatusCode(500, "An error occurred while updating flashcard stats");
            }
        }

        /// <summary>
        /// Gets the statistics for a specific flashcard
        /// </summary>
        /// <param name="userId">The ID of the user to get stats for. If not provided, uses the authenticated user's ID.</param>
        /// <param name="flashcardId">The ID of the flashcard to get stats for</param>
        /// <returns>The statistics for the specified flashcard</returns>
        /// <response code="200">Returns the flashcard statistics</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="404">If the flashcard is not found</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpGet("{userId}/flashcard/{flashcardId}")]
        [SwaggerOperation(
            Summary = "Gets flashcard statistics for a specific flashcard",
            Description = "Retrieves detailed statistics for a specific flashcard including view count, correct/incorrect answer counts, and mastery level",
            OperationId = "GetFlashcardStats",
            Tags = new[] { "UserFlashcardStats" }
        )]
        [SwaggerResponse(StatusCodes.Status200OK, "The flashcard statistics were successfully retrieved", typeof(UserFlashcardStatResponse))]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "User is not authenticated")]
        [SwaggerResponse(StatusCodes.Status404NotFound, "The flashcard was not found")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "An error occurred while processing the request")]
        [ProducesResponseType(typeof(UserFlashcardStatResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserFlashcardStatResponse>> GetFlashcardStats(string userId, string flashcardId)
        {
            try
            {
                // Use provided userId for development/testing, otherwise use authenticated user's ID
                var effectiveUserId = userId ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(effectiveUserId))
                {
                    return Unauthorized();
                }

                var stats = await _userFlashcardStatService.GetFlashcardStatsAsync(
                    effectiveUserId,
                    flashcardId);

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting flashcard stats");
                return StatusCode(500, "An error occurred while retrieving flashcard stats");
            }
        }

        /// <summary>
        /// Increments the view count for a specific flashcard.
        /// </summary>
        /// <remarks>
        /// Sample request:
        /// 
        ///     POST /api/v1/UserFlashcardStats/increment-view
        ///     {
        ///         "flashcardId": "0000000-0000-0000-0000-0000000000",
        ///         "userId": null // Optional: system will use authenticated user's ID if null
        ///     }
        /// 
        /// Notes:
        /// - This endpoint ONLY increments the view count.
        /// - Other statistics like correct/incorrect counts or mastery level are not affected.
        /// - If a stat record for the user and flashcard doesn't exist, it will be created with ViewCount = 1.
        /// </remarks>
        /// <param name="request">The request object containing the flashcard ID and optional user ID</param>
        /// <returns>The updated user flashcard statistics with the incremented view count</returns>
        /// <response code="200">Returns the updated flashcard statistics</response>
        /// <response code="400">If the request parameters are invalid</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpPost("increment-view")]
        [SwaggerOperation(
            Summary = "Increments flashcard view count",
            Description = "Increments the view count for a specific flashcard. Creates a stat record if one doesn't exist.",
            OperationId = "IncrementFlashcardViewCount",
            Tags = new[] { "UserFlashcardStats" }
        )]
        [ProducesResponseType(typeof(UserFlashcardStatResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserFlashcardStatResponse>> IncrementFlashcardViewCount([FromBody] IncrementViewCountRequest request)
        {
            try
            {
                var effectiveUserId = request.UserId ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(effectiveUserId))
                {
                    _logger.LogWarning("User ID could not be determined for incrementing view count.");
                    return Unauthorized("User ID could not be determined.");
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _userFlashcardStatService.IncrementFlashcardViewCountAsync(
                    effectiveUserId,
                    request.FlashcardId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error incrementing flashcard view count via controller.");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while incrementing flashcard view count.");
            }
        }
    }
}