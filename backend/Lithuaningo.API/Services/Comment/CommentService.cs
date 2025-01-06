using Google.Cloud.Firestore;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services
{
    public class CommentService : ICommentService
    {
        private readonly FirestoreDb _db;
        private const string COLLECTION_NAME = "comments";

        public CommentService(FirestoreDb db)
        {
            _db = db ?? throw new ArgumentNullException(nameof(db));
        }

        public async Task<List<Comment>> GetDeckCommentsAsync(string deckId)
        {
            try
            {
                var snapshot = await _db.Collection(COLLECTION_NAME)
                    .WhereEqualTo("deckId", deckId)
                    .OrderByDescending("createdAt")
                    .Limit(20)
                    .GetSnapshotAsync();

                return snapshot.Documents
                    .Select(d => d.ConvertTo<Comment>())
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error getting deck comments: {ex.Message}");
                throw;
            }
        }

        public async Task<Comment?> GetCommentByIdAsync(string id)
        {
            try
            {
                var docRef = _db.Collection(COLLECTION_NAME).Document(id);
                var snapshot = await docRef.GetSnapshotAsync();

                if (!snapshot.Exists)
                    return null;

                return snapshot.ConvertTo<Comment>();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error getting comment: {ex.Message}");
                throw;
            }
        }

        public async Task<string> CreateCommentAsync(Comment comment)
        {
            try
            {
                var docRef = _db.Collection(COLLECTION_NAME).Document();
                comment.Id = docRef.Id;
                comment.CreatedAt = DateTime.UtcNow;
                comment.Likes = 0;

                await docRef.SetAsync(comment);
                return comment.Id;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error creating comment: {ex.Message}");
                throw;
            }
        }

        public async Task UpdateCommentAsync(string id, Comment comment)
        {
            try
            {
                var docRef = _db.Collection(COLLECTION_NAME).Document(id);
                comment.UpdatedAt = DateTime.UtcNow;
                await docRef.SetAsync(comment);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error updating comment: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteCommentAsync(string id)
        {
            try
            {
                await _db.Collection(COLLECTION_NAME).Document(id).DeleteAsync();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error deleting comment: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> LikeCommentAsync(string id, string userId)
        {
            try
            {
                var docRef = _db.Collection(COLLECTION_NAME).Document(id);
                var snapshot = await docRef.GetSnapshotAsync();

                if (!snapshot.Exists)
                    return false;

                await docRef.UpdateAsync("likes", FieldValue.Increment(1));
                return true;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error liking comment: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> UnlikeCommentAsync(string id, string userId)
        {
            try
            {
                var docRef = _db.Collection(COLLECTION_NAME).Document(id);
                var snapshot = await docRef.GetSnapshotAsync();

                if (!snapshot.Exists)
                    return false;

                await docRef.UpdateAsync("likes", FieldValue.Increment(-1));
                return true;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error unliking comment: {ex.Message}");
                throw;
            }
        }
    }
} 