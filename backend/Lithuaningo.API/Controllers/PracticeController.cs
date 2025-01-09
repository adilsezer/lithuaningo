using Microsoft.AspNetCore.Mvc;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;

namespace Lithuaningo.API.Controllers
{
    [ApiController]
    [Route("api/deck")]
    public class PracticeController : ControllerBase
    {
        private readonly IPracticeService _practiceService;

        public PracticeController(IPracticeService practiceService)
        {
            _practiceService = practiceService ?? throw new ArgumentNullException(nameof(practiceService));
        }

        [HttpGet("{deckId}/practice/stats")]
        public async Task<ActionResult<PracticeStats>> GetPracticeStats(
            string deckId,
            [FromQuery] string userId)
        {
            var stats = await _practiceService.GetPracticeStatsAsync(deckId, userId);
            return Ok(stats);
        }

        [HttpPost("{deckId}/practice/track")]
        public async Task<ActionResult> TrackProgress(
            string deckId,
            [FromQuery] string userId,
            [FromQuery] string flashcardId,
            [FromQuery] bool isCorrect)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(flashcardId))
            {
                return BadRequest("UserId and FlashcardId are required");
            }

            await _practiceService.TrackPracticeProgressAsync(
                deckId,
                userId,
                flashcardId,
                isCorrect);

            return NoContent();
        }

        [HttpGet("user/{userId}/practice-history")]
        public async Task<ActionResult<List<PracticeStats>>> GetPracticeHistory(string userId)
        {
            var history = await _practiceService.GetUserPracticeHistoryAsync(userId);
            return Ok(history);
        }
    }
} 