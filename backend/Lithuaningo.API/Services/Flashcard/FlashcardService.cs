using Google.Cloud.Firestore;
using Lithuaningo.API.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services
{
    public class FlashcardService : IFlashcardService
    {
        private readonly FirestoreDb _db;
        private const string COLLECTION_NAME = "flashcards";

        public FlashcardService(FirestoreDb db)
        {
            _db = db ?? throw new ArgumentNullException(nameof(db));
        }

        public async Task<Flashcard?> GetFlashcardByIdAsync(string id)
        {
            try
            {
                var docRef = _db.Collection(COLLECTION_NAME).Document(id);
                var snapshot = await docRef.GetSnapshotAsync();

                if (!snapshot.Exists)
                    return null;

                return snapshot.ConvertTo<Flashcard>();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error getting flashcard {id}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<Flashcard>> GetUserFlashcardsAsync(string userId)
        {
            try
            {
                var snapshot = await _db.Collection(COLLECTION_NAME)
                    .WhereEqualTo("createdBy", userId)
                    .Limit(50)
                    .GetSnapshotAsync();

                return snapshot.Documents.Select(d => d.ConvertTo<Flashcard>()).ToList();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error getting user flashcards: {ex.Message}");
                throw;
            }
        }

        public async Task<string> CreateFlashcardAsync(Flashcard flashcard)
        {
            try
            {
                var docRef = _db.Collection(COLLECTION_NAME).Document();
                flashcard.Id = docRef.Id;
                flashcard.CreatedAt = DateTime.UtcNow;

                await docRef.SetAsync(flashcard);
                return flashcard.Id;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error creating flashcard: {ex.Message}");
                throw;
            }
        }

        public async Task UpdateFlashcardAsync(string id, Flashcard flashcard)
        {
            try
            {
                var docRef = _db.Collection(COLLECTION_NAME).Document(id);
                await docRef.SetAsync(flashcard);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error updating flashcard {id}: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteFlashcardAsync(string id)
        {
            try
            {
                await _db.Collection(COLLECTION_NAME).Document(id).DeleteAsync();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error deleting flashcard {id}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<Flashcard>> GetDueForReviewAsync(string userId, int limit = 20)
        {
            try
            {
                var snapshot = await _db.Collection(COLLECTION_NAME)
                    .WhereEqualTo("createdBy", userId)
                    .OrderBy("createdAt")
                    .Limit(limit)
                    .GetSnapshotAsync();

                return snapshot.Documents.Select(d => d.ConvertTo<Flashcard>()).ToList();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error getting due flashcards: {ex.Message}");
                throw;
            }
        }

        public async Task UpdateReviewStatusAsync(string id, bool wasCorrect)
        {
            try
            {
                var docRef = _db.Collection(COLLECTION_NAME).Document(id);
                var snapshot = await docRef.GetSnapshotAsync();

                if (!snapshot.Exists)
                    return;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error updating review status for flashcard {id}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<Flashcard>> GetRandomFlashcardsAsync(int limit = 10)
        {
            try
            {
                var snapshot = await _db.Collection(COLLECTION_NAME)
                    .OrderByDescending("createdAt")
                    .Limit(limit)
                    .GetSnapshotAsync();

                return snapshot.Documents
                    .Select(d => d.ConvertTo<Flashcard>())
                    .OrderBy(_ => Guid.NewGuid())
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error getting random flashcards: {ex.Message}");
                throw;
            }
        }

        public async Task<List<Flashcard>> SearchFlashcardsAsync(string query)
        {
            try
            {
                var snapshot = await _db.Collection(COLLECTION_NAME)
                    .Limit(20)
                    .GetSnapshotAsync();
                
                return snapshot.Documents
                    .Select(d => d.ConvertTo<Flashcard>())
                    .Where(f => f.Front.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                               f.Back.Contains(query, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error searching flashcards: {ex.Message}");
                throw;
            }
        }
    }
} 