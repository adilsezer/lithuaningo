using Google.Cloud.Firestore;

namespace Lithuaningo.API.Models
{
    [FirestoreData]
    public class PracticeStats
    {
        [FirestoreDocumentId]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("userId")]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty("deckId")]
        public string DeckId { get; set; } = string.Empty;

        [FirestoreProperty("totalCards")]
        public int TotalCards { get; set; }

        [FirestoreProperty("masteredCards")]
        public int MasteredCards { get; set; }

        [FirestoreProperty("needsPractice")]
        public int NeedsPractice { get; set; }

        [FirestoreProperty("lastPracticed")]
        public Timestamp LastPracticed { get; set; }

        [FirestoreProperty("cardProgress")]
        public Dictionary<string, CardProgress> CardProgress { get; set; } = new();
    }

    [FirestoreData]
    public class CardProgress
    {
        [FirestoreProperty("correctAttempts")]
        public int CorrectAttempts { get; set; }

        [FirestoreProperty("totalAttempts")]
        public int TotalAttempts { get; set; }

        [FirestoreProperty("lastPracticed")]
        public Timestamp LastPracticed { get; set; }

        [FirestoreProperty("mastered")]
        public bool Mastered { get; set; }
    }
} 