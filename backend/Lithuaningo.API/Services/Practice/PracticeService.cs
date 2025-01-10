using Google.Cloud.Firestore;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;

namespace Lithuaningo.API.Services
{
    public class PracticeService : IPracticeService
    {
        private readonly FirestoreDb _db;
        private readonly IDeckService _deckService;
        private const string COLLECTION_NAME = "practiceStats";
        private const int MASTERY_THRESHOLD = 3; // Number of correct attempts needed for mastery

        public PracticeService(FirestoreDb db, IDeckService deckService)
        {
            _db = db ?? throw new ArgumentNullException(nameof(db));
            _deckService = deckService ?? throw new ArgumentNullException(nameof(deckService));
        }

        public async Task<PracticeStats> GetPracticeStatsAsync(string deckId, string userId)
        {
            try
            {
                var docId = $"{userId}_{deckId}";
                var docRef = _db.Collection(COLLECTION_NAME).Document(docId);
                var snapshot = await docRef.GetSnapshotAsync();

                if (!snapshot.Exists)
                {
                    // Initialize new stats for first-time practice
                    var flashcards = await _deckService.GetDeckFlashcardsAsync(deckId);
                    var stats = new PracticeStats
                    {
                        Id = docId,
                        UserId = userId,
                        DeckId = deckId,
                        TotalCards = flashcards.Count,
                        MasteredCards = 0,
                        NeedsPractice = flashcards.Count,
                        LastPracticed = DateTime.UtcNow,
                        CardProgress = flashcards.ToDictionary(
                            f => f.Id!,
                            _ => new CardProgress
                            {
                                CorrectAttempts = 0,
                                TotalAttempts = 0,
                                LastPracticed = DateTime.UtcNow,
                                Mastered = false
                            }
                        )
                    };

                    await docRef.SetAsync(stats);
                    return stats;
                }

                return snapshot.ConvertTo<PracticeStats>();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error getting practice stats: {ex.Message}");
                throw;
            }
        }

        public async Task TrackPracticeProgressAsync(string deckId, string userId, string flashcardId, bool isCorrect)
        {
            try
            {
                var docId = $"{userId}_{deckId}";
                var docRef = _db.Collection(COLLECTION_NAME).Document(docId);

                await _db.RunTransactionAsync(async transaction =>
                {
                    var snapshot = await transaction.GetSnapshotAsync(docRef);
                    if (!snapshot.Exists)
                    {
                        // Initialize stats if they don't exist
                        await GetPracticeStatsAsync(deckId, userId);
                        snapshot = await transaction.GetSnapshotAsync(docRef);
                    }

                    var stats = snapshot.ConvertTo<PracticeStats>();

                    // Ensure card progress exists
                    if (!stats.CardProgress.ContainsKey(flashcardId))
                    {
                        stats.CardProgress[flashcardId] = new CardProgress();
                    }

                    var progress = stats.CardProgress[flashcardId];
                    var wasMastered = progress.Mastered;

                    // Update progress
                    progress.TotalAttempts++;
                    if (isCorrect)
                    {
                        progress.CorrectAttempts++;
                    }
                    progress.LastPracticed = DateTime.UtcNow;
                    progress.Mastered = progress.CorrectAttempts >= MASTERY_THRESHOLD;

                    // Update overall stats
                    if (!wasMastered && progress.Mastered)
                    {
                        stats.MasteredCards++;
                        stats.NeedsPractice = Math.Max(0, stats.NeedsPractice - 1);
                    }

                    stats.LastPracticed = DateTime.UtcNow;

                    transaction.Set(docRef, stats);
                });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error tracking practice progress: {ex.Message}");
                throw;
            }
        }

        public async Task<List<PracticeStats>> GetUserPracticeHistoryAsync(string userId)
        {
            try
            {
                var snapshot = await _db.Collection(COLLECTION_NAME)
                    .WhereEqualTo("userId", userId)
                    .OrderByDescending("lastPracticed")
                    .Limit(50)
                    .GetSnapshotAsync();

                return snapshot.Documents
                    .Select(d => d.ConvertTo<PracticeStats>())
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error getting practice history: {ex.Message}");
                throw;
            }
        }
    }
} 