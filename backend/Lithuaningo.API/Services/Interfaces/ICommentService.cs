using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface ICommentService
    {
        Task<List<Comment>> GetDeckCommentsAsync(string deckId);
        Task<Comment?> GetCommentByIdAsync(string commentId);
        Task<Comment> CreateCommentAsync(Comment comment);
        Task<Comment> UpdateCommentAsync(Comment comment);
        Task<bool> DeleteCommentAsync(string commentId);
        Task<List<Comment>> GetUserCommentsAsync(string userId);
    }
}
