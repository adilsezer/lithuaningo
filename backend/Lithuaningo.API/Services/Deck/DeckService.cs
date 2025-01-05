using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Google.Cloud.Firestore;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;

namespace Lithuaningo.API.Services;

public class DeckService : IDeckService
{
    private readonly FirestoreDb _db;
    private const string COLLECTION_NAME = "decks";

    public DeckService(FirestoreDb db)
    {
        _db = db;
    }

    public async Task<List<Models.Deck>> GetDecksAsync(string? category = null, int? limit = null)
    {
        try
        {
            var query = _db.Collection(COLLECTION_NAME).WhereEqualTo("IsPublic", true);

            if (!string.IsNullOrEmpty(category))
            {
                query = query.WhereEqualTo("Category", category);
            }

            if (limit.HasValue)
            {
                query = query.Limit(limit.Value);
            }

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
            var docRef = _db.Collection(COLLECTION_NAME).Document(id);
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
            var snapshot = await _db.Collection(COLLECTION_NAME)
                .WhereEqualTo("CreatedBy", userId)
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
            var snapshot = await _db.Collection(COLLECTION_NAME)
                .WhereEqualTo("IsPublic", true)
                .OrderByDescending("Rating")
                .Limit(limit)
                .GetSnapshotAsync();

            return snapshot.Documents.Select(d => d.ConvertTo<Models.Deck>()).ToList();
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
            var docRef = _db.Collection(COLLECTION_NAME).Document();
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
            var docRef = _db.Collection(COLLECTION_NAME).Document(id);
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
            // Delete all flashcards in the deck
            var flashcardsSnapshot = await _db.Collection("flashcards")
                .WhereEqualTo("DeckId", id)
                .GetSnapshotAsync();

            var batch = _db.StartBatch();
            foreach (var doc in flashcardsSnapshot.Documents)
            {
                batch.Delete(doc.Reference);
            }

            // Delete the deck
            batch.Delete(_db.Collection(COLLECTION_NAME).Document(id));
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
            var docRef = _db.Collection(COLLECTION_NAME).Document(id);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists)
                return false;

            var deck = snapshot.ConvertTo<Models.Deck>();
            var votesCount = deck.VotesCount + (isUpvote ? 1 : -1);
            var newRating = (deck.Rating * deck.VotesCount + (isUpvote ? 1 : 0)) / votesCount;

            await docRef.UpdateAsync(new Dictionary<string, object>
            {
                { "Rating", newRating },
                { "VotesCount", votesCount }
            });

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
            var baseQuery = _db.Collection(COLLECTION_NAME)
                .WhereEqualTo("IsPublic", true);

            if (!string.IsNullOrEmpty(category))
            {
                baseQuery = baseQuery.WhereEqualTo("Category", category);
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
            var snapshot = await _db.Collection("flashcards")
                .WhereEqualTo("DeckId", deckId)
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
            var docRef = _db.Collection("flashcards").Document();
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
            await _db.Collection("flashcards").Document(flashcardId).DeleteAsync();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error removing flashcard from deck: {ex.Message}");
            throw;
        }
    }
} 