using System.Security.Claims;
using Lithuaningo.API.Authorization;
using Lithuaningo.API.DTOs.UserChallengeStats;
using Lithuaningo.API.Services.Stats;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Handles operations related to challenge statistics for users. These include retrieving stats,
    /// updating daily streaks, tracking correct and incorrect answers, and managing challenge completion counts.
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
        /// - Daily streak information (current and longest)
        /// - Today's correct and incorrect answer counts
        /// - Whether today's challenge is completed
        /// - Total challenges completed
        /// - Total correct and incorrect answers
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
            Description = "Gets detailed challenge statistics for a specified user including streak information, answer counts, and completion status",
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
        /// Submits a challenge answer and automatically updates all relevant statistics.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/UserChallengeStats/{userId}/submit-answer
        ///     {
        ///         "wasCorrect": true,
        ///         "challengeId": "00000000-0000-0000-0000-000000000000"
        ///     }
        /// 
        /// This endpoint automatically:
        /// - Updates the daily streak (increments on first answer of a new day)
        /// - Increments correct/incorrect answer counts
        /// - Updates longest streak if needed
        /// - Increments total challenges completed
        /// - Updates the leaderboard if the answer was correct
        /// 
        /// Notes:
        /// - The userId must be a valid GUID
        /// - The challengeId identifies which challenge was answered
        /// - WasCorrect indicates if the user's answer was correct
        /// </remarks>
        /// <param name="request">The challenge answer details</param>
        /// <returns>The updated user challenge statistics</returns>
        /// <response code="200">Returns the updated challenge statistics</response>
        /// <response code="400">Invalid request data or user ID</response>
        /// <response code="404">No challenge stats found for the user</response>
        /// <response code="500">An error occurred while processing the answer</response>
        [HttpPost("submit-answer")]
        [SwaggerOperation(
            Summary = "Submits a challenge answer",
            Description = "Submits a challenge answer and automatically updates all relevant statistics including streak, answer counts, and leaderboard position",
            OperationId = "SubmitChallengeAnswer",
            Tags = new[] { "UserChallengeStats" }
        )]
        [ProducesResponseType(typeof(UserChallengeStatsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserChallengeStatsResponse>> SubmitChallengeAnswer([FromBody] SubmitChallengeAnswerRequest request)
        {
            // Use provided userId for development/testing, otherwise use authenticated user's ID
            var effectiveUserId = request.UserId ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(effectiveUserId))
            {
                return Unauthorized();
            }

            if (request == null)
            {
                _logger.LogWarning("Request body is empty");
                return BadRequest("Request body cannot be empty");
            }

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for challenge answer submission");
                return BadRequest(ModelState);
            }

            try
            {
                var updatedStats = await _userChallengeStatsService.SubmitChallengeAnswerAsync(effectiveUserId, request);
                _logger.LogInformation("Successfully submitted challenge answer for user {UserId}, challenge {ChallengeId}, correct: {WasCorrect}",
                    effectiveUserId, request.ChallengeId, request.WasCorrect);
                return Ok(updatedStats);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "No challenge stats found for user {UserId}", effectiveUserId);
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting challenge answer for user {UserId}", effectiveUserId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}