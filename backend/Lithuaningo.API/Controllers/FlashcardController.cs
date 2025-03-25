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
        
        /// <summary>
        /// Generates flashcards using AI based on the provided parameters
        /// </summary>
        /// <param name="request">The parameters for flashcard generation</param>
        /// <returns>A list of generated flashcards</returns>
        /// <response code="200">Returns the list of generated flashcards</response>
        /// <response code="400">If the request is invalid</response>
        /// <response code="500">If there was an error generating the flashcards</response>
        [HttpPost("generate")]
        [ProducesResponseType(typeof(List<FlashcardResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(
            Summary = "Generates flashcards",
            Description = "Generates flashcards using AI based on the provided description and count",
            OperationId = "GenerateFlashcards",
            Tags = new[] { "Flashcard" }
        )]
        [SwaggerResponse(StatusCodes.Status200OK, "The flashcards were generated successfully", typeof(List<FlashcardResponse>))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "The request parameters are invalid")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, "An error occurred while generating the flashcards")]
        public async Task<ActionResult<List<FlashcardResponse>>> GenerateFlashcards([FromBody] CreateFlashcardRequest request)
        {
            try
            {
                _logger.LogInformation("Generating flashcards with description: {Description}", request.Description);

                // Validate the request
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Generate flashcards using AI
                var flashcards = await _flashcardService.GenerateFlashcardsAsync(request);

                _logger.LogInformation("Successfully generated {Count} flashcards", flashcards.Count);
                return Ok(flashcards);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating flashcards");
                return StatusCode(500, "An error occurred while generating the flashcards");
            }
        }
    }
}
