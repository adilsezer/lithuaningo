using Lithuaningo.API.Authorization;
using Lithuaningo.API.DTOs.Leaderboard;
using Lithuaningo.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages weekly leaderboard functionality for tracking user scores in challenges.
    /// Provides endpoints for retrieving and updating user scores in the current and past weeks.
    /// </summary>
    [Authorize]
    [ApiVersion("1.0")]
    [SwaggerTag("Leaderboard management endpoints")]
    public class LeaderboardController : BaseApiController
    {
        private readonly ILeaderboardService _leaderboardService;
        private readonly ILogger<LeaderboardController> _logger;

        public LeaderboardController(
            ILeaderboardService leaderboardService,
            ILogger<LeaderboardController> logger)
        {
            _leaderboardService = leaderboardService ?? throw new ArgumentNullException(nameof(leaderboardService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Retrieves the current week's top 20 leaders sorted by score
        /// </summary>
        /// <returns>Current week's top 20 leaderboard entries</returns>
        /// <response code="200">Returns the current week's leaderboard</response>
        /// <response code="500">If there was an internal error during retrieval</response>
        [HttpGet("current")]
        [SwaggerOperation(
            Summary = "Retrieves current week leaderboard",
            Description = "Gets the top 20 users sorted by score for the current week",
            OperationId = "GetCurrentWeekLeaderboard",
            Tags = new[] { "Leaderboard" }
        )]
        [ProducesResponseType(typeof(List<LeaderboardEntryResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<LeaderboardEntryResponse>>> GetCurrentWeekLeaderboard()
        {
            try
            {
                var leaderboard = await _leaderboardService.GetCurrentWeekLeaderboardAsync();
                return Ok(leaderboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching current week leaderboard");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error fetching current week leaderboard");
            }
        }

        /// <summary>
        /// Retrieves a specific week's top 20 leaders sorted by score
        /// </summary>
        /// <param name="weekId">The week identifier in YYYY-WW format</param>
        /// <returns>Specified week's top 20 leaderboard entries</returns>
        /// <response code="200">Returns the week's leaderboard</response>
        /// <response code="400">If week ID format is invalid</response>
        /// <response code="500">If there was an internal error during retrieval</response>
        [HttpGet("{weekId}")]
        [SwaggerOperation(
            Summary = "Retrieves week leaderboard",
            Description = "Gets the top 20 users sorted by score for a specific week",
            OperationId = "GetWeekLeaderboard",
            Tags = new[] { "Leaderboard" }
        )]
        [ProducesResponseType(typeof(List<LeaderboardEntryResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<LeaderboardEntryResponse>>> GetWeekLeaderboard(string weekId)
        {
            if (string.IsNullOrWhiteSpace(weekId))
            {
                return BadRequest("Week ID cannot be empty");
            }

            if (!weekId.Contains('-') || weekId.Split('-').Length != 2)
            {
                return BadRequest("Week ID must be in YYYY-WW format");
            }

            try
            {
                var leaderboard = await _leaderboardService.GetWeekLeaderboardAsync(weekId);
                return Ok(leaderboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching leaderboard for week {WeekId}", weekId);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error fetching week leaderboard");
            }
        }

        /// <summary>
        /// Updates a user's score in the current week's leaderboard by adding the new points
        /// </summary>
        /// <param name="request">The leaderboard entry update request containing points to add</param>
        /// <returns>The updated leaderboard entry</returns>
        /// <response code="200">Entry updated successfully</response>
        /// <response code="400">If request model is invalid</response>
        /// <response code="500">If there was an internal error during update</response>
        [HttpPost("entry")]
        [SwaggerOperation(
            Summary = "Updates leaderboard entry",
            Description = "Adds points to a user's score in the current week's leaderboard",
            OperationId = "UpdateLeaderboardEntry",
            Tags = new[] { "Leaderboard" }
        )]
        [ProducesResponseType(typeof(LeaderboardEntryResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<LeaderboardEntryResponse>> UpdateLeaderboardEntry(
            [FromBody] UpdateLeaderboardEntryRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // The score parameter represents points to add to the existing score
                var entry = await _leaderboardService.UpdateLeaderboardEntryAsync(
                    request.UserId.ToString(),
                    request.Score);
                return Ok(entry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating leaderboard entry for user {UserId}", request.UserId);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error updating leaderboard entry");
            }
        }
    }
}
