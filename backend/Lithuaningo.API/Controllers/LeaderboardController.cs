using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.Leaderboard;
using AutoMapper;

namespace Lithuaningo.API.Controllers
{
    /// <summary>
    /// Controller for managing leaderboards
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class LeaderboardController : ControllerBase
    {
        private readonly ILeaderboardService _leaderboardService;
        private readonly ILogger<LeaderboardController> _logger;
        private readonly IMapper _mapper;

        public LeaderboardController(
            ILeaderboardService leaderboardService,
            ILogger<LeaderboardController> logger,
            IMapper mapper)
        {
            _leaderboardService = leaderboardService ?? throw new ArgumentNullException(nameof(leaderboardService));
            _logger = logger;
            _mapper = mapper;
        }

        // GET: api/Leaderboard/current
        [HttpGet("current")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<LeaderboardResponse>> GetCurrentWeekLeaderboard()
        {
            try
            {
                var leaderboard = await _leaderboardService.GetCurrentWeekLeaderboardAsync();
                var response = _mapper.Map<LeaderboardResponse>(leaderboard);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching current week leaderboard");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error fetching current week leaderboard");
            }
        }

        // GET: api/Leaderboard/{weekId}
        [HttpGet("{weekId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<LeaderboardResponse>> GetWeekLeaderboard(string weekId)
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
                var response = _mapper.Map<LeaderboardResponse>(leaderboard);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching leaderboard for week {WeekId}", weekId);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error fetching week leaderboard");
            }
        }

        // POST: api/Leaderboard/entry
        [HttpPost("entry")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> UpdateLeaderboardEntry([FromBody] UpdateLeaderboardEntryRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _leaderboardService.UpdateLeaderboardEntryAsync(request.UserId, request.Name, request.Score);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating leaderboard entry for user {UserId}", request.UserId);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error updating leaderboard entry");
            }
        }
    }
}
