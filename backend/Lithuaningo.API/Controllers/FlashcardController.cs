using Microsoft.AspNetCore.Mvc;
using Lithuaningo.API.Services.Interfaces;

namespace Lithuaningo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FlashcardController : ControllerBase
    {
        private readonly IFlashcardService _flashcardService;
        private readonly IStorageService _storageService;

        public FlashcardController(IFlashcardService flashcardService, IStorageService storageService)
        {
            _flashcardService = flashcardService;
            _storageService = storageService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Flashcard>> GetFlashcard(string id)
        {
            var flashcard = await _flashcardService.GetFlashcardByIdAsync(id);
            if (flashcard == null)
                return NotFound();

            return Ok(flashcard);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<Flashcard>>> GetUserFlashcards(string userId)
        {
            var flashcards = await _flashcardService.GetUserFlashcardsAsync(userId);
            return Ok(flashcards);
        }

        [HttpPost]
        public async Task<ActionResult<string>> CreateFlashcard([FromBody] Flashcard flashcard)
        {
            var flashcardId = await _flashcardService.CreateFlashcardAsync(flashcard);
            return Ok(flashcardId);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateFlashcard(string id, [FromBody] Flashcard flashcard)
        {
            await _flashcardService.UpdateFlashcardAsync(id, flashcard);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteFlashcard(string id)
        {
            await _flashcardService.DeleteFlashcardAsync(id);
            return NoContent();
        }

        [HttpGet("due-for-review")]
        public async Task<ActionResult<List<Flashcard>>> GetDueForReview([FromQuery] string userId, [FromQuery] int limit = 20)
        {
            var flashcards = await _flashcardService.GetDueForReviewAsync(userId, limit);
            return Ok(flashcards);
        }

        [HttpPost("{id}/review")]
        public async Task<ActionResult> UpdateReviewStatus(string id, [FromQuery] bool wasCorrect)
        {
            await _flashcardService.UpdateReviewStatusAsync(id, wasCorrect);
            return NoContent();
        }

        [HttpGet("random")]
        public async Task<ActionResult<List<Flashcard>>> GetRandomFlashcards([FromQuery] int limit = 10)
        {
            var flashcards = await _flashcardService.GetRandomFlashcardsAsync(limit);
            return Ok(flashcards);
        }

        [HttpGet("search")]
        public async Task<ActionResult<List<Flashcard>>> SearchFlashcards([FromQuery] string query)
        {
            var flashcards = await _flashcardService.SearchFlashcardsAsync(query);
            return Ok(flashcards);
        }

        [HttpPost("upload")]
        public async Task<ActionResult<Dictionary<string, string>>> UploadFiles(
            [FromForm] IFormFile? image,
            [FromForm] IFormFile? audio)
        {
            var urls = new Dictionary<string, string>();
            
            try
            {
                if (image != null)
                {
                    urls["imageUrl"] = await _storageService.UploadFileAsync(image, "flashcard-images");
                }
                
                if (audio != null)
                {
                    urls["audioUrl"] = await _storageService.UploadFileAsync(audio, "flashcard-audio");
                }
                
                return Ok(urls);
            }
            catch (Exception)
            {
                return StatusCode(500, "Error uploading files");
            }
        }
    }
} 