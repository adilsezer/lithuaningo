using Microsoft.AspNetCore.Mvc;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lithuaningo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeckController : ControllerBase
    {
        private readonly IDeckService _deckService;

        public DeckController(IDeckService deckService)
        {
            _deckService = deckService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Deck>>> GetDecks([FromQuery] string? category = null, [FromQuery] int? limit = null)
        {
            var decks = await _deckService.GetDecksAsync(category, limit);
            return Ok(decks);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Deck>> GetDeck(string id)
        {
            var deck = await _deckService.GetDeckByIdAsync(id);
            if (deck is null)
                return NotFound();

            return Ok(deck);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<Deck>>> GetUserDecks(string userId)
        {
            var decks = await _deckService.GetUserDecksAsync(userId);
            return Ok(decks);
        }

        [HttpGet("top-rated")]
        public async Task<ActionResult<List<Deck>>> GetTopRatedDecks([FromQuery] int limit = 10)
        {
            var decks = await _deckService.GetTopRatedDecksAsync(limit);
            return Ok(decks);
        }

        [HttpPost]
        public async Task<ActionResult<string>> CreateDeck([FromBody] Deck deck)
        {
            var deckId = await _deckService.CreateDeckAsync(deck);
            return Ok(deckId);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateDeck(string id, [FromBody] Deck deck)
        {
            await _deckService.UpdateDeckAsync(id, deck);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteDeck(string id)
        {
            await _deckService.DeleteDeckAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/vote")]
        public async Task<ActionResult<bool>> VoteDeck(string id, [FromQuery] string userId, [FromQuery] bool isUpvote)
        {
            var result = await _deckService.VoteDeckAsync(id, userId, isUpvote);
            return Ok(result);
        }

        [HttpPost("{id}/report")]
        public async Task<ActionResult> ReportDeck(string id, [FromQuery] string userId, [FromBody] string reason)
        {
            await _deckService.ReportDeckAsync(id, userId, reason);
            return NoContent();
        }

        [HttpGet("search")]
        public async Task<ActionResult<List<Deck>>> SearchDecks([FromQuery] string query, [FromQuery] string? category = null)
        {
            var decks = await _deckService.SearchDecksAsync(query, category);
            return Ok(decks);
        }

        [HttpGet("{deckId}/flashcards")]
        public async Task<ActionResult<List<Flashcard>>> GetDeckFlashcards(string deckId)
        {
            var flashcards = await _deckService.GetDeckFlashcardsAsync(deckId);
            return Ok(flashcards);
        }

        [HttpPost("{deckId}/flashcards")]
        public async Task<ActionResult<string>> AddFlashcardToDeck(string deckId, [FromBody] Flashcard flashcard)
        {
            var flashcardId = await _deckService.AddFlashcardToDeckAsync(deckId, flashcard);
            return Ok(flashcardId);
        }

        [HttpDelete("{deckId}/flashcards/{flashcardId}")]
        public async Task<ActionResult> RemoveFlashcardFromDeck(string deckId, string flashcardId)
        {
            await _deckService.RemoveFlashcardFromDeckAsync(deckId, flashcardId);
            return NoContent();
        }

        [HttpGet("{id}/rating")]
        public async Task<ActionResult<double>> GetDeckRating(string id)
        {
            var rating = await _deckService.GetDeckRatingAsync(id);
            return Ok(rating);
        }
    }
} 