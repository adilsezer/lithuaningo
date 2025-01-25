using Microsoft.AspNetCore.Mvc;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;

namespace Lithuaningo.API.Controllers
{
    [ApiController]
    [Route("api/user")]
    public class UserStatsController : ControllerBase
    {
        private readonly IUserStatsService _userStatsService;

        public UserStatsController(IUserStatsService userStatsService)
        {
            _userStatsService = userStatsService ?? throw new ArgumentNullException(nameof(userStatsService));
        }

        [HttpGet("{userId}/stats")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserStats))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserStats>> GetUserStats(string userId)
        {
            try
            {
                var stats = await _userStatsService.GetUserStatsAsync(userId);
                return Ok(stats);
            }
            catch (Exception ex) when (ex.Message == "User stats not found")
            {
                return NotFound();
            }
        }

        [HttpPost("{userId}/stats")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserStats))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<UserStats>> CreateUserStats(string userId, [FromBody] UserStats stats)
        {
            if (userId != stats.UserId)
            {
                return BadRequest("User ID mismatch");
            }

            await _userStatsService.UpdateUserStatsAsync(stats);
            return Ok(stats);
        }

        [HttpPut("{userId}/stats")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> UpdateUserStats(string userId, [FromBody] UserStats stats)
        {
            if (userId != stats.UserId)
            {
                return BadRequest("User ID mismatch");
            }

            await _userStatsService.UpdateUserStatsAsync(stats);
            return NoContent();
        }
    }
} 