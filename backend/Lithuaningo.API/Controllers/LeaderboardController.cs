using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.DTOs.Leaderboard;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Authorization;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Manages leaderboard functionality including global rankings, weekly challenges,
    /// and user achievement tracking. Provides endpoints for retrieving various types
    /// of leaderboards and user rankings.
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
        /// Retrieves the current week's leaderboard.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Leaderboard/current
        /// 
        /// Returns:
        /// - Current week's rankings
        /// - User scores and positions
        /// - Start and end dates of the week
        /// </remarks>
        /// <returns>Current week's leaderboard</returns>
        /// <response code="200">Returns the current week's leaderboard</response>
        /// <response code="500">If there was an internal error during retrieval</response>
        [HttpGet("current")]
        [SwaggerOperation(
            Summary = "Retrieves current week leaderboard",
            Description = "Gets the leaderboard for the current week",
            OperationId = "GetCurrentWeekLeaderboard",
            Tags = new[] { "Leaderboard" }
        )]
        [ProducesResponseType(typeof(LeaderboardWeekResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<LeaderboardWeekResponse>> GetCurrentWeekLeaderboard()
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
        /// Retrieves a specific week's leaderboard.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     GET /api/v1/Leaderboard/{weekId}
        /// 
        /// Week ID format: YYYY-WW (e.g., 2024-12)
        /// 
        /// Returns:
        /// - Week's rankings
        /// - User scores and positions
        /// - Start and end dates of the week
        /// </remarks>
        /// <param name="weekId">The week identifier in YYYY-WW format</param>
        /// <returns>Specified week's leaderboard</returns>
        /// <response code="200">Returns the week's leaderboard</response>
        /// <response code="400">If week ID format is invalid</response>
        /// <response code="500">If there was an internal error during retrieval</response>
        [HttpGet("{weekId}")]
        [SwaggerOperation(
            Summary = "Retrieves week leaderboard",
            Description = "Gets the leaderboard for a specific week",
            OperationId = "GetWeekLeaderboard",
            Tags = new[] { "Leaderboard" }
        )]
        [ProducesResponseType(typeof(LeaderboardWeekResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<LeaderboardWeekResponse>> GetWeekLeaderboard(string weekId)
        {
            if (string.IsNullOrWhiteSpace(weekId))
            {
                _logger.LogWarning("Week ID cannot be empty");
                return BadRequest("Week ID cannot be empty");
            }
            if (!weekId.Contains('-') || weekId.Split('-').Length != 2)
            {
                _logger.LogWarning("Week ID must be in YYYY-WW format: {WeekId}", weekId);
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
        /// Updates a user's leaderboard entry.
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///     POST /api/v1/Leaderboard/entry
        ///     {
        ///         "userId": "user-guid",
        ///         "score": 100
        ///     }
        /// </remarks>
        /// <param name="request">The leaderboard entry update request</param>
        /// <returns>The updated leaderboard entry</returns>
        /// <response code="200">Entry updated successfully</response>
        /// <response code="400">If request model is invalid</response>
        /// <response code="500">If there was an internal error during update</response>
        [HttpPost("entry")]
        [SwaggerOperation(
            Summary = "Updates leaderboard entry",
            Description = "Updates a user's entry in the current leaderboard",
            OperationId = "UpdateLeaderboardEntry",
            Tags = new[] { "Leaderboard" }
        )]
        [ProducesResponseType(typeof(LeaderboardEntryResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<LeaderboardEntryResponse>> UpdateLeaderboardEntry([FromBody] UpdateLeaderboardEntryRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var entry = await _leaderboardService.UpdateLeaderboardEntryAsync(request.UserId.ToString(), request.Score);
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
