using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly StatsService _statsService;

    public StatsController(StatsService statsService)
    {
        _statsService = statsService;
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetStats(string userId)
    {
        var stats = await _statsService.FetchStatsAsync(userId);
        return stats != null ? Ok(stats) : NotFound();
    }

    [HttpPut]
    public async Task<IActionResult> UpdateStats(string userId, [FromBody] Stats stats)
    {
        await _statsService.UpdateUserStatsAsync(userId, stats);
        return NoContent();
    }
}
