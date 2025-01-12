using Microsoft.AspNetCore.Mvc;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FlashcardController : ControllerBase
    {
        private readonly IFlashcardService _flashcardService;
        private readonly IStorageService _storageService;
        private readonly IOptions<StorageSettings> _storageSettings;

        public FlashcardController(IFlashcardService flashcardService, IStorageService storageService, IOptions<StorageSettings> storageSettings)
        {
            _flashcardService = flashcardService;
            _storageService = storageService;
            _storageSettings = storageSettings;
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
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<string>> UploadFlashcardFile([FromForm] FileUploadModel model)
        {
            try
            {
                var file = model.File;
                var subfolder = file.ContentType.StartsWith("audio/") ? _storageSettings.Value.Paths.Audio 
                    : file.ContentType.StartsWith("image/") ? _storageSettings.Value.Paths.Images 
                    : _storageSettings.Value.Paths.Other;

                var url = await _storageService.UploadFileAsync(
                    file,
                    _storageSettings.Value.Paths.Flashcards,
                    subfolder
                );
                
                return Ok(url);
            }
            catch (Exception)
            {
                return StatusCode(500, "Error uploading flashcard file");
            }
        }
    }
} 