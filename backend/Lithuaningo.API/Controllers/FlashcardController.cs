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
using Lithuaningo.API.Authorization;
using System.Security.Claims;

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
        /// Gets flashcards for a topic, generating new ones if needed
        /// </summary>
        /// <param name="request">The request object containing the count and user ID</param>
        /// <returns>A list of flashcards</returns>
        /// <response code="200">Returns the list of flashcards</response>
        /// <response code="400">If the request parameters are invalid</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpGet]
        [SwaggerOperation(
            Summary = "Get flashcards for a topic",
            Description = "Retrieves flashcards for the specified topic and difficulty level. If there are not enough unseen flashcards, generates new ones using AI.",
            OperationId = "GetFlashcards",
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

                _logger.LogInformation("Getting flashcards for topic '{Topic}' with difficulty '{Difficulty}'", 
                    request.Topic, request.Difficulty);

                var flashcards = await _flashcardService.GetFlashcardsAsync(request.Topic, effectiveUserId, request.Count, request.Difficulty);
                return Ok(flashcards);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting flashcards for topic '{Topic}'", request.Topic);
                return StatusCode(500, "An error occurred while getting flashcards");
            }
        }
    }
}
