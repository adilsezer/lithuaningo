using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.DeckComment;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IDeckCommentService
    {
        /// <summary>
        /// Gets all comments for a specific deck
        /// </summary>
        Task<List<DeckCommentResponse>> GetDeckCommentsAsync(string deckId);

        /// <summary>
        /// Gets a specific comment by its ID
        /// </summary>
        Task<DeckCommentResponse?> GetDeckCommentByIdAsync(string deckCommentId);

        /// <summary>
        /// Creates a new deck comment
        /// </summary>
        Task<DeckCommentResponse> CreateDeckCommentAsync(CreateDeckCommentRequest request);

        /// <summary>
        /// Updates an existing deck comment
        /// </summary>
        Task<DeckCommentResponse> UpdateDeckCommentAsync(string id, UpdateDeckCommentRequest request);

        /// <summary>
        /// Deletes a deck comment
        /// </summary>
        Task<bool> DeleteDeckCommentAsync(string deckCommentId);

        /// <summary>
        /// Gets all comments made by a specific user
        /// </summary>
        Task<List<DeckCommentResponse>> GetUserDeckCommentsAsync(string userId);
    }
}
