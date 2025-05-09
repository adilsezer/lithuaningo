using System.Security.Claims;
using Lithuaningo.API.Authorization;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.Services.Flashcards;
using Lithuaningo.API.Utilities;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages flashcard operations focused on AI generation and file attachments.
    /// </summary>
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("Flashcard management endpoints")]
    public class FlashcardController : BaseApiController
    {
        private readonly IFlashcardService _flashcardService;
        private readonly ILogger<FlashcardController> _logger;

        public FlashcardController(
            IFlashcardService flashcardService,
            ILogger<FlashcardController> logger)
        {
            _flashcardService = flashcardService ?? throw new ArgumentNullException(nameof(flashcardService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets flashcards for a category, generating new ones if needed
        /// </summary>
        /// <param name="request">The request object containing the category, difficulty, and count</param>
        /// <returns>A list of flashcards</returns>
        /// <response code="200">Returns the list of flashcards</response>
        /// <response code="400">If the request parameters are invalid</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpGet("learning")]
        [SwaggerOperation(
            Summary = "Get learning flashcards for a user",
            Description = "Retrieves flashcards for the specified category and difficulty level with spaced repetition. If there are not enough unseen flashcards, generates new ones using AI.",
            OperationId = "GetUserLearningFlashcards",
            Tags = new[] { "Flashcard" }
        )]
        [SwaggerResponse(StatusCodes.Status200OK, "The flashcards were successfully retrieved", typeof(IEnumerable<FlashcardResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Invalid input parameters")]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "User is not authenticated")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "An error occurred while processing the request")]
        [ProducesResponseType(typeof(IEnumerable<FlashcardResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetFlashcards([FromQuery] FlashcardRequest request)
        {
            try
            {
                // Use provided userId for development/testing, otherwise use authenticated user's ID
                var effectiveUserId = request.UserId ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(effectiveUserId))
                {
                    return Unauthorized();
                }

                var flashcardResponses = await _flashcardService.GetUserLearningFlashcardsAsync(request, effectiveUserId);

                return Ok(flashcardResponses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting learning flashcards");
                return StatusCode(500, "An error occurred while getting flashcards");
            }
        }
    }
}
