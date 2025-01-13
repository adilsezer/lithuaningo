using Google.Cloud.Firestore;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services
{
    public class FlashcardService : IFlashcardService
    {
        private readonly FirestoreDb _db;
        private readonly string _flashcardsCollection;
        private readonly string _decksCollection;

        public FlashcardService(
            FirestoreDb db, 
            IOptions<FirestoreCollectionSettings> collectionSettings)
        {
            _db = db ?? throw new ArgumentNullException(nameof(db));
            _flashcardsCollection = collectionSettings.Value.Flashcards;
            _decksCollection = collectionSettings.Value.Decks;
        }

        private async Task UpdateDeckFlashcardCount(string deckId, int change)
        {
            try
            {
                var deckRef = _db.Collection(_decksCollection).Document(deckId);
                await _db.RunTransactionAsync(async transaction =>
                {
                    var snapshot = await transaction.GetSnapshotAsync(deckRef);
                    if (!snapshot.Exists)
                        throw new Exception($"Deck {deckId} not found");

                    var deck = snapshot.ConvertTo<Deck>();
                    deck.FlashcardCount = Math.Max(0, deck.FlashcardCount + change);
                    
                    transaction.Update(deckRef, new Dictionary<string, object>
                    {
                        { "flashcardCount", deck.FlashcardCount }
                    });
                });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error updating flashcard count: {ex.Message}");
                throw;
            }
        }

        public async Task<Flashcard?> GetFlashcardByIdAsync(string id)
        {
            try
            {
                var docRef = _db.Collection(_flashcardsCollection).Document(id);
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
                var snapshot = await _db.Collection(_flashcardsCollection)
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
                var docRef = _db.Collection(_flashcardsCollection).Document();
                flashcard.Id = docRef.Id;
                flashcard.CreatedAt = DateTime.UtcNow;

                await docRef.SetAsync(flashcard);
                await UpdateDeckFlashcardCount(flashcard.DeckId, 1);
                
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
                var docRef = _db.Collection(_flashcardsCollection).Document(id);
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
                var docRef = _db.Collection(_flashcardsCollection).Document(id);
                var snapshot = await docRef.GetSnapshotAsync();
                
                if (!snapshot.Exists)
                    return;

                var flashcard = snapshot.ConvertTo<Flashcard>();
                await docRef.DeleteAsync();
                await UpdateDeckFlashcardCount(flashcard.DeckId, -1);
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
                var snapshot = await _db.Collection(_flashcardsCollection)
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
                var docRef = _db.Collection(_flashcardsCollection).Document(id);
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
                var snapshot = await _db.Collection(_flashcardsCollection)
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
                var snapshot = await _db.Collection(_flashcardsCollection)
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