using Google.Cloud.Firestore;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;

namespace Lithuaningo.API.Services;

public class DeckService : IDeckService
{
    private readonly FirestoreDb _db;
    private readonly IUserService _userService;
    private readonly string _collectionName;
    private readonly string _votesCollection;
    private readonly string _flashcardsCollection;
    private readonly string _reportsCollection;

    public DeckService(FirestoreDb db, IUserService userService, IOptions<FirestoreCollectionSettings> collectionSettings)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _userService = userService;
        _collectionName = collectionSettings.Value.Decks;
        _votesCollection = collectionSettings.Value.DeckVotes;
        _flashcardsCollection = collectionSettings.Value.Flashcards;
        _reportsCollection = collectionSettings.Value.Reports;
    }

    public async Task<List<Models.Deck>> GetDecksAsync(string? category = null, int? limit = 20)
    {
        try
        {
            Query query = _db.Collection(_collectionName);

            if (!string.IsNullOrEmpty(category))
            {
                query = query.WhereEqualTo("category", category);
            }

            // Always apply a limit
            query = query.Limit(limit ?? 20);

            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents.Select(d => d.ConvertTo<Models.Deck>()).ToList();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error getting decks: {ex.Message}");
            throw;
        }
    }

    public async Task<Models.Deck?> GetDeckByIdAsync(string id)
    {
        try
        {
            var docRef = _db.Collection(_collectionName).Document(id);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
                return null;

            return snapshot.ConvertTo<Models.Deck>();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error getting deck {id}: {ex.Message}");
            throw;
        }
    }

    public async Task<List<Models.Deck>> GetUserDecksAsync(string userId)
    {
        try
        {
            var snapshot = await _db.Collection(_collectionName)
                .WhereEqualTo("createdBy", userId)
                .GetSnapshotAsync();

            return snapshot.Documents.Select(d => d.ConvertTo<Models.Deck>()).ToList();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error getting user decks: {ex.Message}");
            throw;
        }
    }

    public async Task<List<Models.Deck>> GetTopRatedDecksAsync(int limit = 10)
    {
        try
        {
            // Get decks with limit * 2 to have enough after filtering
            Query query = _db.Collection(_collectionName)
                .Limit(limit * 2);

            var decksSnapshot = await query.GetSnapshotAsync();
            var decks = decksSnapshot.Documents.Select(d => d.ConvertTo<Models.Deck>()).ToList();
            var decksWithRatings = new List<(Models.Deck Deck, double Rating)>();
            
            foreach (var deck in decks)
            {
                if (deck.Id == null) continue;
                var rating = await GetDeckRatingAsync(deck.Id);
                decksWithRatings.Add((deck, rating));
            }

            return decksWithRatings
                .OrderByDescending(d => d.Rating)
                .Take(limit)
                .Select(d => d.Deck)
                .ToList();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error getting top rated decks: {ex.Message}");
            throw;
        }
    }

    public async Task<string> CreateDeckAsync(Models.Deck deck)
    {
        try
        {
            var user = await _userService.GetUserProfileAsync(deck.CreatedBy);
            deck.CreatedByUsername = user?.Name ?? "Unknown User";
            
            var docRef = _db.Collection(_collectionName).Document();
            deck.Id = docRef.Id;
            await docRef.SetAsync(deck);
            return deck.Id;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error creating deck: {ex.Message}");
            throw;
        }
    }

    public async Task UpdateDeckAsync(string id, Models.Deck deck)
    {
        try
        {
            var docRef = _db.Collection(_collectionName).Document(id);
            await docRef.SetAsync(deck);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error updating deck: {ex.Message}");
            throw;
        }
    }

    public async Task DeleteDeckAsync(string id)
    {
        try
        {
            var flashcardsSnapshot = await _db.Collection("flashcards")
                .WhereEqualTo("deckId", id)
                .GetSnapshotAsync();

            var batch = _db.StartBatch();
            foreach (var doc in flashcardsSnapshot.Documents)
            {
                batch.Delete(doc.Reference);
            }

            batch.Delete(_db.Collection(_collectionName).Document(id));
            await batch.CommitAsync();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error deleting deck {id}: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> VoteDeckAsync(string id, string userId, bool isUpvote)
    {
        try
        {
            // Check if deck exists
            var deckRef = _db.Collection(_collectionName).Document(id);
            var deckSnapshot = await deckRef.GetSnapshotAsync();
            if (!deckSnapshot.Exists)
                return false;

            // Check for existing vote
            var voteQuery = _db.Collection(_votesCollection)
                .WhereEqualTo("deckId", id)
                .WhereEqualTo("userId", userId);
            var voteSnapshot = await voteQuery.GetSnapshotAsync();
            var existingVote = voteSnapshot.Documents.Count > 0 ? voteSnapshot.Documents[0] : null;

            if (existingVote != null)
            {
                var vote = existingVote.ConvertTo<DeckVote>();
                if (vote.IsUpvote == isUpvote)
                    return true; // Same vote, no change needed

                // Update existing vote
                await existingVote.Reference.UpdateAsync("isUpvote", isUpvote);
            }
            else
            {
                // Create new vote
                var vote = new DeckVote
                {
                    DeckId = id,
                    UserId = userId,
                    IsUpvote = isUpvote,
                    CreatedAt = DateTime.UtcNow
                };
                await _db.Collection(_votesCollection).AddAsync(vote);
            }

            return true;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error voting for deck {id}: {ex.Message}");
            throw;
        }
    }

    public async Task<List<Models.Deck>> SearchDecksAsync(string query, string? category = null)
    {
        try
        {
            Query baseQuery = _db.Collection(_collectionName);

            if (!string.IsNullOrEmpty(category))
            {
                baseQuery = baseQuery.WhereEqualTo("category", category);
            }

            var snapshot = await baseQuery.GetSnapshotAsync();
            var decks = snapshot.Documents
                .Select(d => d.ConvertTo<Models.Deck>())
                .Where(d => d.Title.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                           d.Description.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                           d.Tags.Any(t => t.Contains(query, StringComparison.OrdinalIgnoreCase)))
                .ToList();

            return decks;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error searching decks: {ex.Message}");
            throw;
        }
    }

    public async Task<List<Flashcard>> GetDeckFlashcardsAsync(string deckId)
    {
        try
        {
            var snapshot = await _db.Collection(_flashcardsCollection)
                .WhereEqualTo("deckId", deckId)
                .GetSnapshotAsync();

            return snapshot.Documents.Select(d => d.ConvertTo<Flashcard>()).ToList();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error getting deck flashcards: {ex.Message}");
            throw;
        }
    }

    public async Task<string> AddFlashcardToDeckAsync(string deckId, Flashcard flashcard)
    {
        try
        {
            var docRef = _db.Collection(_flashcardsCollection).Document();
            flashcard.Id = docRef.Id;
            flashcard.DeckId = deckId;
            flashcard.CreatedAt = DateTime.UtcNow;

            await docRef.SetAsync(flashcard);
            return flashcard.Id;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error adding flashcard to deck: {ex.Message}");
            throw;
        }
    }

    public async Task RemoveFlashcardFromDeckAsync(string deckId, string flashcardId)
    {
        try
        {
            await _db.Collection(_flashcardsCollection).Document(flashcardId).DeleteAsync();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error removing flashcard from deck: {ex.Message}");
            throw;
        }
    }

    public async Task ReportDeckAsync(string id, string userId, string reason)
    {
        try
        {
            var reportRef = _db.Collection(_reportsCollection).Document();
            var report = new Dictionary<string, object>
            {
                { "deckId", id },
                { "userId", userId },
                { "reason", reason },
                { "createdAt", DateTime.UtcNow },
                { "status", "pending" }
            };

            await reportRef.SetAsync(report);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error reporting deck {id}: {ex.Message}");
            throw;
        }
    }

    public async Task<double> GetDeckRatingAsync(string deckId)
    {
        try
        {
            var votesSnapshot = await _db.Collection(_votesCollection)
                .WhereEqualTo("deckId", deckId)
                .GetSnapshotAsync();

            if (votesSnapshot.Count == 0)
                return 0;

            var votes = votesSnapshot.Documents.Select(d => d.ConvertTo<DeckVote>());
            var upvotes = votes.Count(v => v.IsUpvote);
            var totalVotes = votesSnapshot.Count;

            return (double)upvotes / totalVotes;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error getting deck rating: {ex.Message}");
            throw;
        }
    }
} 