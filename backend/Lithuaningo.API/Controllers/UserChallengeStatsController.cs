using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.DTOs.UserChallengeStats;
using AutoMapper;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Authorization;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Handles operations related to challenge statistics for users. These include retrieving stats,
    /// updating daily streaks, adding experience points, marking words as learned, and incrementing quiz completion counts.
    /// </summary>
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("Challenge statistics management endpoints")]
    public class UserChallengeStatsController : BaseApiController
    {
        private readonly IUserChallengeStatsService _userChallengeStatsService;
        private readonly ILogger<UserChallengeStatsController> _logger;
        private readonly IMapper _mapper;

        public UserChallengeStatsController(
            IUserChallengeStatsService userChallengeStatsService,
            ILogger<UserChallengeStatsController> logger,
            IMapper mapper)
        {
            _userChallengeStatsService = userChallengeStatsService ?? throw new ArgumentNullException(nameof(userChallengeStatsService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        /// <summary>
        /// Retrieves challenge statistics for a specified user.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/ChallengeStats/{userId}/stats
        /// 
        /// The response includes:
        /// - Daily streak information
        /// - Experience points
        /// - Learned words count
        /// - Total quizzes completed
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
            Tags = new[] { "ChallengeStats" }
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

                var response = _mapper.Map<UserChallengeStatsResponse>(stats);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user challenge stats for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Updates the daily streak for the specified user.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/ChallengeStats/{userId}/stats/streak
        /// 
        /// This endpoint should be called when a user completes their daily challenge
        /// to maintain their streak count.
        /// </remarks>
        /// <param name="userId">The user's unique identifier</param>
        /// <response code="204">Daily streak updated successfully</response>
        /// <response code="400">User ID is empty</response>
        /// <response code="500">An error occurred while updating the streak</response>
        [HttpPost("{userId}/stats/streak")]
        [SwaggerOperation(
            Summary = "Updates daily streak",
            Description = "Updates the daily streak counter for a user",
            OperationId = "UpdateDailyStreak",
            Tags = new[] { "ChallengeStats" }
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateDailyStreak(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("User ID parameter is empty");
                return BadRequest("User ID cannot be empty");
            }

            try
            {
                await _userChallengeStatsService.UpdateDailyStreakAsync(userId);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for user {UserId}", userId);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating daily streak for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Increments the total number of quizzes completed by a user.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/ChallengeStats/{userId}/stats/quiz-completed
        /// 
        /// This endpoint should be called each time a user completes a quiz,
        /// regardless of their performance.
        /// </remarks>
        /// <param name="userId">The user's unique identifier</param>
        /// <response code="204">Quiz count incremented successfully</response>
        /// <response code="400">User ID is empty</response>
        /// <response code="500">An error occurred while updating the stats</response>
        [HttpPost("{userId}/stats/quiz-completed")]
        [SwaggerOperation(
            Summary = "Increments completed quizzes",
            Description = "Increments the total number of quizzes completed by a user",
            OperationId = "IncrementQuizzesCompleted",
            Tags = new[] { "ChallengeStats" }
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> IncrementQuizzesCompleted(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("User ID parameter is empty");
                return BadRequest("User ID cannot be empty");
            }

            try
            {
                await _userChallengeStatsService.IncrementTotalQuizzesCompletedAsync(userId);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for user {UserId}", userId);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error incrementing quizzes completed for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}