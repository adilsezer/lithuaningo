using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Services.Cache;
using Microsoft.AspNetCore.Authorization;
using Lithuaningo.API.Services.Interfaces;

namespace Lithuaningo.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiVersion("1.0")]
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
        /// Clears all cache entries
        /// </summary>
        [HttpPost("cache/clear")]
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
        /// Clears specific cache by prefix
        /// </summary>
        [HttpPost("cache/clear/{prefix}")]
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