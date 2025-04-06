using System.Security.Claims;
using FluentValidation;
using Lithuaningo.API.Authorization;
using Lithuaningo.API.DTOs.UserFlashcardStats;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Stats;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lithuaningo.API.Controllers
{
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
        /// Updates the statistics for a flashcard after user review
        /// </summary>
        /// <param name="request">The request object containing the flashcard ID, correctness, and optional user ID</param>
        /// <returns>The updated user flashcard statistics</returns>
        /// <response code="200">Returns the updated flashcard statistics</response>
        /// <response code="400">If the request parameters are invalid</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpPost("submit-answer")]
        [SwaggerOperation(
            Summary = "Submit flashcard answer",
            Description = "Submits a flashcard answer and automatically updates all relevant statistics including streak, answer counts, and leaderboard",
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

                _logger.LogInformation("Updating flashcard stats for flashcard {FlashcardId} and user {UserId}",
                    request.FlashcardId, effectiveUserId);

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
                _logger.LogError(ex, "Error updating flashcard stats for flashcard {FlashcardId}", request.FlashcardId);
                return StatusCode(500, "An error occurred while updating flashcard stats");
            }
        }
    }
}