using System.Security.Claims;
using Lithuaningo.API.Authorization;
using Lithuaningo.API.DTOs.UserChatStats;
using Lithuaningo.API.Services.Stats;
using Lithuaningo.API.Utilities;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages user statistics for chat, including tracking message counts and enforcing limits for free users.
    /// </summary>
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("User Chat Statistics management endpoints")]
    public class UserChatStatsController : BaseApiController
    {
        private readonly IUserChatStatsService _userChatStatsService;
        private readonly ILogger<UserChatStatsController> _logger;

        public UserChatStatsController(
            IUserChatStatsService userChatStatsService,
            ILogger<UserChatStatsController> logger)
        {
            _userChatStatsService = userChatStatsService ?? throw new ArgumentNullException(nameof(userChatStatsService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets user chat statistics
        /// </summary>
        /// <param name="userId">The ID of the user to get stats for. If not provided, uses the authenticated user's ID.</param>
        /// <returns>User chat statistics</returns>
        /// <response code="200">Returns the user's chat statistics</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpGet("{userId}/stats")]
        [SwaggerOperation(
            Summary = "Get user chat statistics",
            Description = "Retrieves the chat usage statistics for a user",
            OperationId = "UserChatStats.GetStats"
        )]
        [ProducesResponseType(typeof(UserChatStatsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserChatStatsResponse>> GetStats(string? userId = null)
        {
            try
            {
                // Use provided userId for development/testing, otherwise use authenticated user's ID
                var effectiveUserId = userId ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(effectiveUserId))
                {
                    return Unauthorized();
                }

                _logger.LogInformation("Getting chat stats");

                var stats = await _userChatStatsService.GetUserChatStatsAsync(effectiveUserId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting chat stats for user");
                return StatusCode(500, "An error occurred while retrieving chat stats");
            }
        }

        /// <summary>
        /// Tracks a chat message sent by the user
        /// </summary>
        /// <param name="request">Optional tracking details</param>
        /// <returns>The updated chat statistics</returns>
        /// <response code="200">Returns the updated chat statistics</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpPost("track-message")]
        [SwaggerOperation(
            Summary = "Track a chat message",
            Description = "Records that a user has sent a chat message and updates their stats",
            OperationId = "UserChatStats.TrackMessage"
        )]
        [ProducesResponseType(typeof(UserChatStatsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserChatStatsResponse>> TrackMessage([FromBody] TrackMessageRequest? request = null)
        {
            try
            {
                // Use provided userId for development/testing, otherwise use authenticated user's ID
                var effectiveUserId = request?.UserId ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(effectiveUserId))
                {
                    return Unauthorized();
                }

                _logger.LogInformation("Tracking chat message");

                var stats = await _userChatStatsService.TrackMessageAsync(effectiveUserId, request);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error tracking chat message for user");
                return StatusCode(500, "An error occurred while tracking chat message");
            }
        }

        /// <summary>
        /// Checks if a user has reached their daily message limit
        /// </summary>
        /// <param name="userId">The ID of the user to check. If not provided, uses the authenticated user's ID.</param>
        /// <param name="isPremium">Whether the user has premium status</param>
        /// <returns>Whether the user has reached their daily message limit</returns>
        /// <response code="200">Returns whether the user has reached their daily limit</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="500">If there was an error processing the request</response>
        [HttpGet("{userId}/has-reached-limit")]
        [SwaggerOperation(
            Summary = "Check if user has reached daily message limit",
            Description = "Determines if a user has sent the maximum number of chat messages allowed for free users",
            OperationId = "UserChatStats.HasReachedLimit"
        )]
        [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<bool>> HasReachedLimit(string? userId = null, bool isPremium = false)
        {
            try
            {
                // Use provided userId for development/testing, otherwise use authenticated user's ID
                var effectiveUserId = userId ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(effectiveUserId))
                {
                    return Unauthorized();
                }

                _logger.LogInformation("Checking chat limit");

                var hasReachedLimit = await _userChatStatsService.HasReachedDailyLimitAsync(effectiveUserId, isPremium);
                return Ok(hasReachedLimit);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking chat limit for user");
                return StatusCode(500, "An error occurred while checking chat limit");
            }
        }
    }
}