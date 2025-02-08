using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.DTOs.AppInfo;
using AutoMapper;
using Swashbuckle.AspNetCore.Annotations;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages application information for different platforms such as iOS and Android.
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [SwaggerTag("Application information management endpoints")]
    public class AppInfoController : ControllerBase
    {
        private readonly IAppInfoService _appInfoService;
        private readonly ILogger<AppInfoController> _logger;
        private readonly IMapper _mapper;

        public AppInfoController(
            IAppInfoService appInfoService,
            ILogger<AppInfoController> logger,
            IMapper mapper)
        {
            _appInfoService = appInfoService ?? throw new ArgumentNullException(nameof(appInfoService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
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
                var response = _mapper.Map<AppInfoResponse>(appInfo);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving app info for platform {Platform}", platform);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Updates application information for the specified platform.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     PUT /api/v1/AppInfo/{platform}
        ///     {
        ///         "version": "1.2.0",
        ///         "minVersion": "1.0.0",
        ///         "mandatoryUpdate": false,
        ///         "updateMessage": "New features available"
        ///     }
        /// </remarks>
        /// <param name="platform">The platform identifier (e.g., "ios", "android")</param>
        /// <param name="request">The updated application information</param>
        /// <returns>The updated application information</returns>
        /// <response code="200">Returns the updated app information</response>
        /// <response code="400">Platform parameter is empty or ModelState errors exist</response>
        /// <response code="500">An error occurred during the update</response>
        [HttpPut("{platform}")]
        [SwaggerOperation(
            Summary = "Updates application information",
            Description = "Updates application information for the specified platform",
            OperationId = "UpdateAppInfo",
            Tags = new[] { "AppInfo" }
        )]
        [ProducesResponseType(typeof(AppInfoResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<AppInfoResponse>> UpdateAppInfo(string platform, [FromBody] UpdateAppInfoRequest request)
        {
            if (string.IsNullOrWhiteSpace(platform))
            {
                _logger.LogWarning("Platform parameter is empty");
                return BadRequest("Platform cannot be empty");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var appInfo = _mapper.Map<AppInfo>(request);
                appInfo.Platform = platform;
                var updatedAppInfo = await _appInfoService.UpdateAppInfoAsync(platform, appInfo);
                var response = _mapper.Map<AppInfoResponse>(updatedAppInfo);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating app info for platform {Platform}", platform);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Deletes application information specified by ID.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     DELETE /api/v1/AppInfo/{id}
        /// </remarks>
        /// <param name="id">The unique GUID identifier of the app info</param>
        /// <response code="204">App info successfully deleted</response>
        /// <response code="400">Invalid id format</response>
        /// <response code="500">An error occurred while deleting the information</response>
        [HttpDelete("{id}")]
        [SwaggerOperation(
            Summary = "Deletes application information",
            Description = "Deletes application information specified by ID (GUID)",
            OperationId = "DeleteAppInfo",
            Tags = new[] { "AppInfo" }
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteAppInfo(string id)
        {
            if (!Guid.TryParse(id, out _))
            {
                _logger.LogWarning("Invalid app info id format: {Id}", id);
                return BadRequest("Invalid id format");
            }

            try
            {
                await _appInfoService.DeleteAppInfoAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting app info with id {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
