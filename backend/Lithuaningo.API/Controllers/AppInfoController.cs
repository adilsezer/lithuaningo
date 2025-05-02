using Lithuaningo.API.Authorization;
using Lithuaningo.API.DTOs.AppInfo;
using Lithuaningo.API.Services.AppInfo;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages application information for different platforms such as iOS and Android.
    /// </summary>
    [ApiVersion("1.0")]
    [SwaggerTag("Application information management endpoints")]
    public class AppInfoController : BaseApiController
    {
        private readonly IAppInfoService _appInfoService;
        private readonly ILogger<AppInfoController> _logger;

        public AppInfoController(
            IAppInfoService appInfoService,
            ILogger<AppInfoController> logger)
        {
            _appInfoService = appInfoService ?? throw new ArgumentNullException(nameof(appInfoService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Health check endpoint to verify API is running correctly
        /// </summary>
        /// <returns>Simple health status response</returns>
        /// <response code="200">API is healthy and running correctly</response>
        [AllowAnonymous]
        [HttpGet("health")]
        [SwaggerOperation(
            Summary = "Health check endpoint",
            Description = "Simple endpoint to verify the API is running correctly",
            OperationId = "GetHealth",
            Tags = new[] { "AppInfo" }
        )]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public ActionResult GetHealth()
        {
            return Ok(new
            {
                status = "Healthy",
                timestamp = DateTime.UtcNow,
                version = "1.0.0",
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
            });
        }

        /// <summary>
        /// Retrieves application information for a specified platform.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/AppInfo/{platform}
        /// 
        /// Platform values can be:
        /// - "ios"
        /// - "android"
        /// </remarks>
        /// <param name="platform">The platform identifier (e.g., "ios", "android")</param>
        /// <returns>Application information for the specified platform</returns>
        /// <response code="200">Returns app info for the requested platform</response>
        /// <response code="400">Platform parameter is empty</response>
        /// <response code="404">No app info available for the specified platform</response>
        /// <response code="500">An error occurred while retrieving app information</response>
        [AllowAnonymous]
        [HttpGet("{platform}")]
        [SwaggerOperation(
            Summary = "Retrieves application information for a platform",
            Description = "Gets application information for a specified platform (ios/android)",
            OperationId = "GetAppInfo",
            Tags = new[] { "AppInfo" }
        )]
        [ProducesResponseType(typeof(AppInfoResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<AppInfoResponse>> GetAppInfo(string platform)
        {
            if (string.IsNullOrWhiteSpace(platform))
            {
                _logger.LogWarning("Platform parameter is empty");
                return BadRequest("Platform cannot be empty");
            }

            try
            {
                var appInfo = await _appInfoService.GetAppInfoAsync(platform);
                if (appInfo == null)
                {
                    return NotFound();
                }
                return Ok(appInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving app info for platform {Platform}", platform);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
