using Microsoft.AspNetCore.Mvc;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;

namespace Lithuaningo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly ILeaderboardService _leaderboardService;

    public LeaderboardController(ILeaderboardService leaderboardService)
    {
        _leaderboardService = leaderboardService ?? throw new ArgumentNullException(nameof(leaderboardService));
    }

    [HttpGet("current")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(LeaderboardWeek))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<LeaderboardWeek>> GetCurrentWeekLeaderboard()
    {
        try
        {
            var leaderboard = await _leaderboardService.GetCurrentWeekLeaderboardAsync();
            return Ok(leaderboard);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error fetching current week leaderboard: {ex.Message}");
        }
    }

    [HttpGet("{weekId}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(LeaderboardWeek))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<LeaderboardWeek>> GetWeekLeaderboard(string weekId)
    {
        if (string.IsNullOrWhiteSpace(weekId))
            return BadRequest("Week ID cannot be empty");

        if (!weekId.Contains('-') || weekId.Split('-').Length != 2)
            return BadRequest("Week ID must be in YYYY-WW format");

        try
        {
            var leaderboard = await _leaderboardService.GetWeekLeaderboardAsync(weekId);
            return Ok(leaderboard);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error fetching week leaderboard: {ex.Message}");
        }
    }

    [HttpPost("entry")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> UpdateLeaderboardEntry(
        [FromBody] UpdateLeaderboardEntryRequest request)
    {
        if (string.IsNullOrEmpty(request.UserId))
            return BadRequest("User ID is required");

        if (string.IsNullOrEmpty(request.Name))
            return BadRequest("Name is required");

        try
        {
            await _leaderboardService.UpdateLeaderboardEntryAsync(
                request.UserId,
                request.Name,
                request.Score);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error updating leaderboard entry: {ex.Message}");
        }
    }
}

public class UpdateLeaderboardEntryRequest
{
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Score { get; set; }
} 