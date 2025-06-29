using AutoMapper;
using Lithuaningo.API.Authorization;
using Lithuaningo.API.DTOs.Admin;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Admin;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Challenges;
using Lithuaningo.API.Services.Flashcards;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Provides administrative operations for system management including cache control and flashcard review.
    /// </summary>
    [RequireAdmin]
    [ApiVersion("1.0")]
    [SwaggerTag("Administrative operations for system management")]
    public class AdminController : BaseApiController
    {
        private readonly ICacheService _cacheService;
        private readonly IFlashcardService _flashcardService;
        private readonly IDataIntegrityService _dataIntegrityService;
        private readonly IMapper _mapper;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            ICacheService cacheService,
            IFlashcardService flashcardService,
            IChallengeService challengeService,
            IDataIntegrityService dataIntegrityService,
            IMapper mapper,
            ILogger<AdminController> logger)
        {
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _flashcardService = flashcardService ?? throw new ArgumentNullException(nameof(flashcardService));
            _dataIntegrityService = dataIntegrityService ?? throw new ArgumentNullException(nameof(dataIntegrityService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Clears all cache entries from the system.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/Admin/cache/clear
        /// 
        /// This endpoint will remove all cached items from the system.
        /// Use with caution as it may temporarily impact system performance.
        /// </remarks>
        /// <returns>A success message if the cache was cleared successfully</returns>
        /// <response code="200">Cache was successfully cleared</response>
        /// <response code="401">User is not authenticated</response>
        /// <response code="403">User is not authorized to perform this action</response>
        /// <response code="500">If there was an internal error while clearing the cache</response>
        [HttpPost("cache/clear")]
        [SwaggerOperation(
            Summary = "Clears all cache entries",
            Description = "Removes all cached items from the system. This operation may temporarily impact system performance.",
            OperationId = "ClearAllCache",
            Tags = new[] { "Admin" }
        )]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ClearCache()
        {
            try
            {
                _logger.LogInformation("Admin requested to clear all cache entries");
                // Remove all cache entries with an empty prefix (matches everything)
                await _cacheService.RemoveByPrefixAsync("");
                return Ok(new { message = "Cache cleared successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cache");
                return StatusCode(500, "Failed to clear cache");
            }
        }

        /// <summary>
        /// Clears cache entries matching a specific prefix.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/Admin/cache/clear/users
        /// 
        /// Common prefix examples:
        /// - users: Clears user-related cache
        /// - flashcards: Clears flashcard-related cache
        /// - decks: Clears deck-related cache
        /// </remarks>
        /// <param name="prefix">The prefix to match cache entries against</param>
        /// <returns>A success message if the cache was cleared successfully</returns>
        /// <response code="200">Cache entries with the specified prefix were successfully cleared</response>
        /// <response code="401">User is not authenticated</response>
        /// <response code="403">User is not authorized to perform this action</response>
        /// <response code="500">If there was an internal error while clearing the cache</response>
        [HttpPost("cache/clear/{prefix}")]
        [SwaggerOperation(
            Summary = "Clears cache by prefix",
            Description = "Removes all cached items that match the specified prefix. Useful for clearing specific categories of cached data.",
            OperationId = "ClearCacheByPrefix",
            Tags = new[] { "Admin" }
        )]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ClearCacheByPrefix(string prefix)
        {
            try
            {
                _logger.LogInformation("Admin requested to clear cache entries with specific prefix");
                await _cacheService.RemoveByPrefixAsync(prefix);
                return Ok(new { message = $"Cache entries with prefix '{prefix}' cleared successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cache with prefix");
                return StatusCode(500, "Failed to clear cache");
            }
        }

        /// <summary>
        /// Retrieves a list of unverified flashcards for admin review.
        /// </summary>
        /// <param name="limit">Maximum number of flashcards to return (default 20).</param>
        /// <returns>A list of unverified flashcards.</returns>
        /// <response code="200">Returns the list of unverified flashcards.</response>
        /// <response code="401">User is not authenticated.</response>
        /// <response code="403">User is not authorized (not an admin).</response>
        /// <response code="500">Internal server error.</response>
        [HttpGet("flashcards/unverified")]
        [SwaggerOperation(
            Summary = "Get unverified flashcards",
            Description = "Retrieves a list of flashcards marked as not verified, intended for admin review.",
            OperationId = "GetUnverifiedFlashcards",
            Tags = new[] { "Admin", "Flashcards" }
        )]
        [ProducesResponseType(typeof(IEnumerable<FlashcardResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<FlashcardResponse>>> GetUnverifiedFlashcards([FromQuery] int limit = 20)
        {
            try
            {
                var flashcards = await _flashcardService.RetrieveFlashcardModelsAsync(limit: limit, isVerified: false);
                var response = _mapper.Map<IEnumerable<FlashcardResponse>>(flashcards);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving unverified flashcards.");
                return StatusCode(500, "Failed to retrieve unverified flashcards.");
            }
        }

        /// <summary>
        /// Updates a specific flashcard (admin operation).
        /// </summary>
        /// <param name="flashcardId">The ID of the flashcard to update.</param>
        /// <param name="request">The updated flashcard data.</param>
        /// <returns>The updated flashcard.</returns>
        /// <response code="200">Returns the updated flashcard.</response>
        /// <response code="400">Invalid request data.</response>
        /// <response code="401">User is not authenticated.</response>
        /// <response code="403">User is not authorized (not an admin).</response>
        /// <response code="404">Flashcard not found.</response>
        /// <response code="500">Internal server error.</response>
        [HttpPut("flashcards/{flashcardId}")]
        [SwaggerOperation(
            Summary = "Update a flashcard (Admin)",
            Description = "Allows an administrator to update the details of a specific flashcard, including its verification status.",
            OperationId = "UpdateFlashcardAdmin",
            Tags = new[] { "Admin", "Flashcards" }
        )]
        [ProducesResponseType(typeof(FlashcardResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<FlashcardResponse>> UpdateFlashcardAdmin(Guid flashcardId, [FromBody] UpdateFlashcardAdminRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updatedFlashcard = await _flashcardService.UpdateFlashcardAdminAsync(flashcardId, request);
                var response = _mapper.Map<FlashcardResponse>(updatedFlashcard);
                return Ok(response);
            }
            catch (KeyNotFoundException knfex)
            {
                _logger.LogWarning(knfex, "Flashcard not found for update");
                return NotFound(new { message = knfex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating flashcard (admin).");
                return StatusCode(500, "Failed to update flashcard.");
            }
        }

        /// <summary>
        /// Regenerates the image for a specific flashcard.
        /// </summary>
        /// <param name="flashcardId">The ID of the flashcard.</param>
        /// <returns>The new image URL.</returns>
        /// <response code="200">Returns the new image URL.</response>
        /// <response code="401">User is not authenticated.</response>
        /// <response code="403">User is not authorized (not an admin).</response>
        /// <response code="404">Flashcard not found.</response>
        /// <response code="500">Internal server error or AI generation failed.</response>
        [HttpPost("flashcards/{flashcardId}/regenerate-image")]
        [SwaggerOperation(
            Summary = "Regenerate flashcard image (Admin)",
            Description = "Triggers the AI image generation service for the specified flashcard and updates its image URL.",
            OperationId = "RegenerateFlashcardImageAdmin",
            Tags = new[] { "Admin", "Flashcards", "AI" }
        )]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RegenerateFlashcardImage(Guid flashcardId)
        {
            try
            {
                var imageUrl = await _flashcardService.GenerateFlashcardImageAsync(flashcardId);
                return Ok(new { imageUrl });
            }
            catch (KeyNotFoundException knfex)
            {
                _logger.LogWarning(knfex, "Flashcard not found for image regeneration");
                return NotFound(new { message = knfex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error regenerating image for flashcard (admin).");
                return StatusCode(500, "Failed to regenerate flashcard image.");
            }
        }

        /// <summary>
        /// Regenerates the audio for a specific flashcard.
        /// </summary>
        /// <param name="flashcardId">The ID of the flashcard.</param>
        /// <returns>The new audio URL.</returns>
        /// <response code="200">Returns the new audio URL.</response>
        /// <response code="401">User is not authenticated.</response>
        /// <response code="403">User is not authorized (not an admin).</response>
        /// <response code="404">Flashcard not found.</response>
        /// <response code="500">Internal server error or AI generation failed.</response>
        [HttpPost("flashcards/{flashcardId}/regenerate-audio")]
        [SwaggerOperation(
            Summary = "Regenerate flashcard audio (Admin)",
            Description = "Triggers the AI audio generation service for the specified flashcard and updates its audio URL.",
            OperationId = "RegenerateFlashcardAudioAdmin",
            Tags = new[] { "Admin", "Flashcards", "AI" }
        )]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RegenerateFlashcardAudio(Guid flashcardId)
        {
            try
            {
                var audioUrl = await _flashcardService.GenerateFlashcardAudioAsync(flashcardId);
                return Ok(new { audioUrl });
            }
            catch (KeyNotFoundException knfex)
            {
                _logger.LogWarning(knfex, "Flashcard not found for audio regeneration");
                return NotFound(new { message = knfex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error regenerating audio for flashcard (admin).");
                return StatusCode(500, "Failed to regenerate flashcard audio.");
            }
        }

        /// <summary>
        /// Validates and fixes data integrity issues in flashcards and challenge questions tables.
        /// </summary>
        /// <param name="fixIssues">If true, automatically fixes found issues. If false, only reports issues.</param>
        /// <returns>A report of issues found and actions taken.</returns>
        /// <response code="200">Returns the validation and fix report.</response>
        /// <response code="401">User is not authenticated.</response>
        /// <response code="403">User is not authorized (not an admin).</response>
        /// <response code="500">Internal server error.</response>
        [HttpPost("validate-and-fix-data")]
        [SwaggerOperation(
            Summary = "Validate and fix data integrity issues",
            Description = "Validates flashcards and challenge questions for missing values or incorrect relationships, and optionally fixes them.",
            OperationId = "ValidateAndFixData",
            Tags = new[] { "Admin", "Data Integrity" }
        )]
        [ProducesResponseType(typeof(DataIntegrityReport), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ValidateAndFixData([FromQuery] bool fixIssues = false)
        {
            try
            {
                _logger.LogInformation("Admin requested data validation and fix. Fix issues: {FixIssues}", fixIssues);

                var report = await _dataIntegrityService.ValidateAndFixDataAsync(fixIssues);

                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during data validation and fix operation");
                return StatusCode(500, "Failed to validate and fix data");
            }
        }

        /// <summary>
        /// Deletes a flashcard and its associated files from storage.
        /// </summary>
        /// <param name="flashcardId">The ID of the flashcard to delete.</param>
        /// <returns>Success message if the flashcard was deleted.</returns>
        /// <response code="200">Flashcard was successfully deleted.</response>
        /// <response code="401">User is not authenticated.</response>
        /// <response code="403">User is not authorized (not an admin).</response>
        /// <response code="404">Flashcard not found.</response>
        /// <response code="500">Internal server error.</response>
        [HttpDelete("flashcards/{flashcardId}")]
        [SwaggerOperation(
            Summary = "Delete a flashcard (Admin)",
            Description = "Permanently deletes a flashcard and its associated image and audio files from storage.",
            OperationId = "DeleteFlashcard",
            Tags = new[] { "Admin", "Flashcards" }
        )]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteFlashcard(Guid flashcardId)
        {
            try
            {
                var deleted = await _flashcardService.DeleteFlashcardAsync(flashcardId);
                if (!deleted)
                {
                    return NotFound(new { message = "Flashcard not found" });
                }

                return Ok(new { message = "Flashcard and associated files deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting flashcard {FlashcardId}", flashcardId);
                return StatusCode(500, "Failed to delete flashcard");
            }
        }
    }
}