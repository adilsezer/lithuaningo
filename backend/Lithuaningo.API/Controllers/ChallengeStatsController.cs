using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.DTOs.ChallengeStats;
using AutoMapper;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Controller for managing challenge statistics
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class ChallengeStatsController : ControllerBase
    {
        private readonly IChallengeStatsService _challengeStatsService;
        private readonly ILogger<ChallengeStatsController> _logger;
        private readonly IMapper _mapper;

        public ChallengeStatsController(
            IChallengeStatsService challengeStatsService,
            ILogger<ChallengeStatsController> logger,
            IMapper mapper)
        {
            _challengeStatsService = challengeStatsService ?? throw new ArgumentNullException(nameof(challengeStatsService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper;
        }

        /// <summary>
        /// Gets the challenge statistics for a user
        /// </summary>
        /// <param name="userId">The user's unique identifier</param>
        /// <returns>The user's challenge statistics</returns>
        [HttpGet("{userId}/stats")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ChallengeStatsResponse>> GetChallengeStats(string userId)
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
                var stats = await _challengeStatsService.GetChallengeStatsAsync(userId);
                if (stats == null)
                {
                    _logger.LogInformation("Challenge stats not found for user {UserId}", userId);
                    return NotFound();
                }

                var response = _mapper.Map<ChallengeStatsResponse>(stats);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving challenge stats for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Updates the daily streak for a user
        /// </summary>
        /// <param name="userId">The user's unique identifier</param>
        [HttpPost("{userId}/stats/streak")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateDailyStreak(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("User ID parameter is empty");
                return BadRequest("User ID cannot be empty");
            }

            try
            {
                await _challengeStatsService.UpdateDailyStreakAsync(userId);
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
        /// Adds experience points to a user's profile
        /// </summary>
        /// <param name="userId">The user's unique identifier</param>
        /// <param name="request">The experience points to add</param>
        [HttpPost("{userId}/stats/experience")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AddExperiencePoints(string userId, [FromBody] AddExperienceRequest request)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("User ID parameter is empty");
                return BadRequest("User ID cannot be empty");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _challengeStatsService.AddExperiencePointsAsync(userId, request.Amount);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for user {UserId}", userId);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding experience points for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Adds a learned word to a user's profile
        /// </summary>
        /// <param name="userId">The user's unique identifier</param>
        /// <param name="request">The word to mark as learned</param>
        [HttpPost("{userId}/stats/learned-word")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AddLearnedWord(string userId, [FromBody] AddLearnedWordRequest request)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("User ID parameter is empty");
                return BadRequest("User ID cannot be empty");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _challengeStatsService.AddLearnedWordAsync(userId, request.WordId);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for user {UserId}", userId);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding learned word for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Increments the total number of quizzes completed by a user
        /// </summary>
        /// <param name="userId">The user's unique identifier</param>
        [HttpPost("{userId}/stats/quiz-completed")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> IncrementQuizzesCompleted(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("User ID parameter is empty");
                return BadRequest("User ID cannot be empty");
            }

            try
            {
                await _challengeStatsService.IncrementTotalQuizzesCompletedAsync(userId);
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