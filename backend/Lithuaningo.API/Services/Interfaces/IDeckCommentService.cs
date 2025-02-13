using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IDeckCommentService
    {
        Task<List<DeckComment>> GetDeckCommentsAsync(string deckId);
        Task<DeckComment?> GetDeckCommentByIdAsync(string deckCommentId);
        Task<DeckComment> CreateDeckCommentAsync(DeckComment deckComment);
        Task<DeckComment> UpdateDeckCommentAsync(DeckComment deckComment);
        Task<bool> DeleteDeckCommentAsync(string deckCommentId);
        Task<List<DeckComment>> GetUserDeckCommentsAsync(string userId);
    }
}
