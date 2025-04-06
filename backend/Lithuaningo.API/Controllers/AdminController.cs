using Lithuaningo.API.Authorization;
using Lithuaningo.API.Services.Cache;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Provides administrative operations for system management including cache control.
    /// </summary>
    [RequireAdmin]
    [ApiVersion("1.0")]
    [SwaggerTag("Administrative operations for system management")]
    public class AdminController : BaseApiController
    {
        private readonly ICacheService _cacheService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            ICacheService cacheService,
            ILogger<AdminController> logger)
        {
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
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
                _logger.LogInformation("Admin requested to clear cache entries with prefix: {Prefix}", prefix);
                await _cacheService.RemoveByPrefixAsync(prefix);
                return Ok(new { message = $"Cache entries with prefix '{prefix}' cleared successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cache with prefix: {Prefix}", prefix);
                return StatusCode(500, "Failed to clear cache");
            }
        }
    }
}