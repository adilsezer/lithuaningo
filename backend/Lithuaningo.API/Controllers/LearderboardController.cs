using Lithuaningo.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Lithuaningo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaderboardController : ControllerBase
    {
        private readonly ILeaderboardService _leaderboardService;

        public LeaderboardController(ILeaderboardService leaderboardService)
        {
            _leaderboardService = leaderboardService;
        }

        [HttpGet]
        public async Task<ActionResult<List<UserProfile>>> GetLeaderboard()
        {
            var leaderboard = await _leaderboardService.GetLeaderboardEntriesAsync();
            return Ok(leaderboard);
        }

        [HttpPost]
        public async Task<ActionResult> AddLeaderboardEntry(LeaderboardEntry entry)
        {
            await _leaderboardService.AddLeaderboardEntryAsync(entry);
            return NoContent();
        }

        [HttpPost("reset")]
        public async Task<ActionResult> ResetLeaderboard()
        {
            await _leaderboardService.ResetLeaderboardAsync();
            return NoContent();
        }
    }
}