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
using System.Linq;
using AutoMapper;

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
        [HttpGet]
        [SwaggerOperation(
            Summary = "Get flashcards for a category",
            Description = "Retrieves flashcards for the specified category and difficulty level. If there are not enough unseen flashcards, generates new ones using AI.",
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

                _logger.LogInformation("Getting flashcards for category '{Category}', difficulty '{Difficulty}'{Hint}", 
                    request.PrimaryCategory, 
                    request.Difficulty,
                    !string.IsNullOrEmpty(request.Hint) ? $" and hint '{request.Hint}'" : string.Empty);

                var flashcardResponses = await _flashcardService.GetFlashcardsAsync(request, effectiveUserId);
                
                return Ok(flashcardResponses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting flashcards for category '{Category}', difficulty '{Difficulty}'{Hint}", 
                    request.PrimaryCategory, 
                    request.Difficulty,
                    !string.IsNullOrEmpty(request.Hint) ? $" and hint '{request.Hint}'" : string.Empty);
                return StatusCode(500, "An error occurred while getting flashcards");
            }
        }
        
        /// <summary>
        /// Generates an image for a flashcard using AI and updates the flashcard
        /// </summary>
        /// <param name="id">The ID of the flashcard</param>
        /// <param name="userId">Optional user ID for development/testing</param>
        /// <returns>The URL of the generated image</returns>
        /// <response code="200">Returns the URL of the generated image</response>
        /// <response code="400">If the flashcard ID is invalid</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="404">If the flashcard was not found</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpPost("{id}/generate-image")]
        [SwaggerOperation(
            Summary = "Generate an image for a flashcard",
            Description = "Uses AI to generate an image based on the flashcard's front word and updates the flashcard.",
            OperationId = "GenerateFlashcardImage",
            Tags = new[] { "Flashcard" }
        )]
        [SwaggerResponse(StatusCodes.Status200OK, "The image was successfully generated", typeof(string))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "Invalid flashcard ID")]
        [SwaggerResponse(StatusCodes.Status401Unauthorized, "User is not authenticated")]
        [SwaggerResponse(StatusCodes.Status404NotFound, "Flashcard not found")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "An error occurred while generating the image")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GenerateFlashcardImage([FromRoute] Guid id, [FromQuery] string? userId = null)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return BadRequest("Invalid flashcard ID");
                }
                
                // Use provided userId for development/testing, otherwise use authenticated user's ID
                var effectiveUserId = userId ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(effectiveUserId))
                {
                    return Unauthorized();
                }
                
                _logger.LogInformation("Generating image for flashcard {Id} for user {UserId}", id, effectiveUserId);
                
                try
                {
                    var imageUrl = await _flashcardService.GenerateFlashcardImageAsync(id);
                    return Ok(imageUrl);
                }
                catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
                {
                    return NotFound($"Flashcard with ID {id} not found");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating image for flashcard {Id}", id);
                return StatusCode(500, "An error occurred while generating the image");
            }
        }
    }
}
