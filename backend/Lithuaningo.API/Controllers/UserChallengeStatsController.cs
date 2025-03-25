using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.DTOs.UserChallengeStats;
using Swashbuckle.AspNetCore.Annotations;
using Lithuaningo.API.Authorization;
using Microsoft.AspNetCore.Http;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Handles operations related to challenge statistics for users. These include retrieving stats,
    /// updating daily streaks, adding experience points, marking words as learned, and incrementing challenge completion counts.
    /// </summary>
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("Challenge statistics management endpoints")]
    public class UserChallengeStatsController : BaseApiController
    {
        private readonly IUserChallengeStatsService _userChallengeStatsService;
        private readonly ILogger<UserChallengeStatsController> _logger;

        public UserChallengeStatsController(
            IUserChallengeStatsService userChallengeStatsService,
            ILogger<UserChallengeStatsController> logger)
        {
            _userChallengeStatsService = userChallengeStatsService ?? throw new ArgumentNullException(nameof(userChallengeStatsService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Retrieves challenge statistics for a specified user.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/UserChallengeStats/{userId}/stats
        /// 
        /// The response includes:
        /// - Daily streak information
        /// - Experience points
        /// - Learned words count
        /// - Total challenges completed
        /// </remarks>
        /// <param name="userId">The user's unique identifier (should be a valid GUID)</param>
        /// <returns>The user's challenge statistics</returns>
        /// <response code="200">Returns a ChallengeStatsResponse object</response>
        /// <response code="400">User ID is empty or not in a valid format</response>
        /// <response code="404">No statistics found for the user</response>
        /// <response code="500">An error occurred while retrieving stats</response>
        [HttpGet("{userId}/stats")]
        [SwaggerOperation(
            Summary = "Retrieves challenge statistics for a user",
            Description = "Gets detailed challenge statistics for a specified user",
            OperationId = "GetChallengeStats",
            Tags = new[] { "UserChallengeStats" }
        )]
        [ProducesResponseType(typeof(UserChallengeStatsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserChallengeStatsResponse>> GetUserChallengeStats(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("User ID parameter is empty");
                return BadRequest("User ID cannot be empty");
            }

            if (!Guid.TryParse(userId, out var userGuid))
            {
                _logger.LogWarning("Invalid user ID format: {UserId}", userId);
                return BadRequest("Invalid user ID format");
            }

            try
            {
                var stats = await _userChallengeStatsService.GetUserChallengeStatsAsync(userId);
                if (stats == null)
                {
                    _logger.LogInformation("Challenge stats not found for user {UserId}", userId);
                    return NotFound();
                }

                _logger.LogInformation("Retrieved stats for user {UserId}: LastChallengeDate={LastChallengeDate}, TodayCorrectAnswers={TodayCorrectAnswers}, TodayIncorrectAnswers={TodayIncorrectAnswers}", 
                    userId, 
                    stats.LastChallengeDate, 
                    stats.TodayCorrectAnswers, 
                    stats.TodayIncorrectAnswers);
                
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user challenge stats for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }
        
        /// <summary>
        /// Creates new challenge statistics for a user.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/UserChallengeStats
        ///     {
        ///         "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        ///         "currentStreak": 0,
        ///         "longestStreak": 0,
        ///         "todayCorrectAnswers": 0,
        ///         "todayIncorrectAnswers": 0,
        ///         "totalChallengesCompleted": 0,
        ///         "totalCorrectAnswers": 0,
        ///         "totalIncorrectAnswers": 0
        ///     }
        /// </remarks>
        /// <param name="request">The challenge statistics to create</param>
        /// <returns>The created challenge statistics</returns>
        /// <response code="201">Returns the newly created challenge statistics</response>
        /// <response code="400">Invalid request data</response>
        /// <response code="409">Challenge statistics already exist for the user</response>
        /// <response code="500">An error occurred while creating the stats</response>
        [HttpPost]
        [SwaggerOperation(
            Summary = "Creates challenge statistics for a user",
            Description = "Creates new challenge statistics for a specified user",
            OperationId = "CreateChallengeStats",
            Tags = new[] { "UserChallengeStats" }
        )]
        [ProducesResponseType(typeof(UserChallengeStatsResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status409Conflict)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserChallengeStatsResponse>> CreateUserChallengeStats([FromBody] CreateUserChallengeStatsRequest request)
        {
            if (request == null)
            {
                _logger.LogWarning("Request body is empty");
                return BadRequest("Request body cannot be empty");
            }

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for create challenge stats request");
                return BadRequest(ModelState);
            }

            try
            {
                var stats = await _userChallengeStatsService.CreateUserChallengeStatsAsync(request);
                _logger.LogInformation("Created or retrieved challenge stats for user {UserId}", request.UserId);
                return CreatedAtAction(nameof(GetUserChallengeStats), new { userId = request.UserId.ToString() }, stats);
            }
            catch (InvalidOperationException ex)
            {
                // This case should rarely occur now since we're handling this in the service
                _logger.LogWarning(ex, "Cannot create challenge stats: {Message}", ex.Message);
                
                // Try to get existing stats instead of returning an error
                try
                {
                    var existingStats = await _userChallengeStatsService.GetUserChallengeStatsAsync(request.UserId.ToString());
                    _logger.LogInformation("Retrieved existing stats for user {UserId} after failed creation", request.UserId);
                    return Ok(existingStats);
                }
                catch (Exception innerEx)
                {
                    _logger.LogError(innerEx, "Failed to retrieve existing stats after creation failure for user {UserId}", request.UserId);
                    return Conflict(ex.Message);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating challenge stats for user {UserId}", request.UserId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Updates challenge statistics for a user.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     PUT /api/v1/UserChallengeStats/{userId}
        ///     {
        ///         "currentStreak": 5,
        ///         "longestStreak": 10,
        ///         "todayCorrectAnswers": 15,
        ///         "todayIncorrectAnswers": 3,
        ///         "totalChallengesCompleted": 50,
        ///         "totalCorrectAnswers": 200,
        ///         "totalIncorrectAnswers": 30
        ///     }
        /// </remarks>
        /// <param name="userId">The ID of the user to update stats for</param>
        /// <param name="request">The updated challenge statistics</param>
        /// <response code="204">Stats updated successfully</response>
        /// <response code="400">Invalid request data or user ID</response>
        /// <response code="404">No challenge stats found for the user</response>
        /// <response code="500">An error occurred while updating the stats</response>
        [HttpPut("{userId}")]
        [SwaggerOperation(
            Summary = "Updates challenge statistics for a user",
            Description = "Updates existing challenge statistics for a specified user and updates their leaderboard entry when correct answers are added",
            OperationId = "UpdateChallengeStats",
            Tags = new[] { "UserChallengeStats" }
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> UpdateUserChallengeStats(string userId, [FromBody] UpdateUserChallengeStatsRequest request)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("User ID parameter is empty");
                return BadRequest("User ID cannot be empty");
            }

            if (!Guid.TryParse(userId, out var userGuid))
            {
                _logger.LogWarning("Invalid user ID format: {UserId}", userId);
                return BadRequest("Invalid user ID format");
            }

            if (request == null)
            {
                _logger.LogWarning("Request body is empty");
                return BadRequest("Request body cannot be empty");
            }

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for update challenge stats request");
                return BadRequest(ModelState);
            }

            try
            {
                await _userChallengeStatsService.UpdateUserChallengeStatsAsync(userId, request);
                _logger.LogInformation("Updated challenge stats for user {UserId}", userId);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "No challenge stats found for user {UserId}", userId);
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating challenge stats for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Updates the daily streak for a user.
        /// </summary>
        /// <remarks>
        /// Increments the user's daily streak and updates their longest streak if needed.
        /// </remarks>
        /// <param name="userId">The ID of the user to update the streak for</param>
        /// <response code="204">Streak updated successfully</response>
        /// <response code="400">Invalid user ID</response>
        /// <response code="404">No challenge stats found for the user</response>
        /// <response code="500">An error occurred</response>
        [HttpPost("{userId}/stats/streak")]
        [SwaggerOperation(
            Summary = "Updates a user's daily streak",
            Description = "Increments a user's daily streak and updates their longest streak if needed",
            OperationId = "UpdateDailyStreak",
            Tags = new[] { "UserChallengeStats" }
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> UpdateDailyStreak(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("User ID parameter is empty");
                return BadRequest("User ID cannot be empty");
            }

            if (!Guid.TryParse(userId, out var userGuid))
            {
                _logger.LogWarning("Invalid user ID format: {UserId}", userId);
                return BadRequest("Invalid user ID format");
            }

            try
            {
                // Get current stats
                var currentStats = await _userChallengeStatsService.GetUserChallengeStatsAsync(userId);
                
                if (currentStats == null)
                {
                    return NotFound();
                }

                // Update streak values
                var newCurrentStreak = currentStats.CurrentStreak + 1;
                var newLongestStreak = Math.Max(newCurrentStreak, currentStats.LongestStreak);
                
                // Create update request with valid streak values
                var updateRequest = new UpdateUserChallengeStatsRequest
                {
                    CurrentStreak = newCurrentStreak,
                    LongestStreak = newLongestStreak,
                    TodayCorrectAnswers = currentStats.TodayCorrectAnswers,
                    TodayIncorrectAnswers = currentStats.TodayIncorrectAnswers,
                    TotalChallengesCompleted = currentStats.TotalChallengesCompleted,
                    TotalCorrectAnswers = currentStats.TotalCorrectAnswers,
                    TotalIncorrectAnswers = currentStats.TotalIncorrectAnswers
                };
                
                await _userChallengeStatsService.UpdateUserChallengeStatsAsync(userId, updateRequest);
                _logger.LogInformation("Updated daily streak for user {UserId}", userId);
                
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "No challenge stats found for user {UserId}", userId);
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating daily streak for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}