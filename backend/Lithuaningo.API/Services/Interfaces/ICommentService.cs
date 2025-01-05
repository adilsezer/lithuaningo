using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface ICommentService
    {
        Task<List<Comment>> GetDeckCommentsAsync(string deckId);
        Task<Comment?> GetCommentByIdAsync(string id);
        Task<string> CreateCommentAsync(Comment comment);
        Task UpdateCommentAsync(string id, Comment comment);
        Task DeleteCommentAsync(string id);
        Task<bool> LikeCommentAsync(string id, string userId);
        Task<bool> UnlikeCommentAsync(string id, string userId);
    }
} 