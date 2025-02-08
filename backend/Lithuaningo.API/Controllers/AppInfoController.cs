using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.DTOs.AppInfo;
using AutoMapper;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Controller for managing application information
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
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
            _logger = logger;
            _mapper = mapper;
        }

        /// <summary>
        /// Gets application information for a specific platform
        /// </summary>
        /// <param name="platform">The platform identifier (e.g., "ios", "android")</param>
        /// <returns>Application information for the specified platform</returns>
        [HttpGet("{platform}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
        /// Updates application information for a specific platform
        /// </summary>
        /// <param name="platform">The platform identifier (e.g., "ios", "android")</param>
        /// <param name="request">The updated application information</param>
        /// <returns>The updated application information</returns>
        [HttpPut("{platform}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
        /// Deletes application information
        /// </summary>
        /// <param name="id">The unique identifier of the app info to delete</param>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
