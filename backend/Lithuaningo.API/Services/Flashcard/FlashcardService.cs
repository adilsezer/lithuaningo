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
        private const string REPORTS_COLLECTION = "reports";

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
                flashcard.VotesUp = 0;
                flashcard.VotesDown = 0;
                flashcard.ReviewCount = 0;
                flashcard.CorrectRate = 0;

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

        public async Task<bool> VoteFlashcardAsync(string id, string userId, bool isUpvote)
        {
            try
            {
                var docRef = _db.Collection(COLLECTION_NAME).Document(id);
                var snapshot = await docRef.GetSnapshotAsync();

                if (!snapshot.Exists)
                    return false;

                var flashcard = snapshot.ConvertTo<Flashcard>();
                
                if (isUpvote)
                    flashcard.VotesUp++;
                else
                    flashcard.VotesDown++;

                await docRef.UpdateAsync(new Dictionary<string, object>
                {
                    { "votesUp", flashcard.VotesUp },
                    { "votesDown", flashcard.VotesDown }
                });

                return true;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error voting for flashcard {id}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<Flashcard>> GetDueForReviewAsync(string userId, int limit = 20)
        {
            try
            {
                var cutoffTime = DateTime.UtcNow.AddHours(-24);

                var snapshot = await _db.Collection(COLLECTION_NAME)
                    .WhereEqualTo("createdBy", userId)
                    .WhereLessThan("lastReviewedAt", cutoffTime)
                    .OrderBy("lastReviewedAt")
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

                var flashcard = snapshot.ConvertTo<Flashcard>();
                flashcard.ReviewCount++;
                flashcard.LastReviewedAt = DateTime.UtcNow;
                flashcard.CorrectRate = ((flashcard.CorrectRate * (flashcard.ReviewCount - 1)) + (wasCorrect ? 1 : 0)) / flashcard.ReviewCount;

                await docRef.UpdateAsync(new Dictionary<string, object>
                {
                    { "reviewCount", flashcard.ReviewCount },
                    { "lastReviewedAt", flashcard.LastReviewedAt },
                    { "correctRate", flashcard.CorrectRate }
                });
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
                    .OrderBy("createdAt")
                    .Limit(limit * 3)
                    .GetSnapshotAsync();

                return snapshot.Documents
                    .Select(d => d.ConvertTo<Flashcard>())
                    .OrderBy(x => Guid.NewGuid())
                    .Take(limit)
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
                var snapshot = await _db.Collection(COLLECTION_NAME).GetSnapshotAsync();
                
                return snapshot.Documents
                    .Select(d => d.ConvertTo<Flashcard>())
                    .Where(f => f.Front.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                               f.Back.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                               (f.ExampleSentence != null && f.ExampleSentence.Contains(query, StringComparison.OrdinalIgnoreCase)))
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error searching flashcards: {ex.Message}");
                throw;
            }
        }

        public async Task ReportFlashcardAsync(string id, string userId, string reason)
        {
            try
            {
                var report = new Dictionary<string, object>
                {
                    { "flashcardId", id },
                    { "reportedBy", userId },
                    { "reason", reason },
                    { "createdAt", DateTime.UtcNow },
                    { "status", "pending" }
                };

                await _db.Collection(REPORTS_COLLECTION).AddAsync(report);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error reporting flashcard {id}: {ex.Message}");
                throw;
            }
        }
    }
} 