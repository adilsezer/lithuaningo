using Google.Cloud.Firestore;
using System;

namespace Lithuaningo.API.Models
{
    [FirestoreData]
    public class Comment
    {
        [FirestoreDocumentId]
        public string? Id { get; set; }

        [FirestoreProperty("deckId")]
        public string DeckId { get; set; } = string.Empty;

        [FirestoreProperty("userId")]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty("content")]
        public string Content { get; set; } = string.Empty;

        [FirestoreProperty("createdBy")]
        public string CreatedBy { get; set; } = string.Empty;

        [FirestoreProperty("createdAt")]
        public DateTime CreatedAt { get; set; }

        [FirestoreProperty("updatedAt")]
        public DateTime? UpdatedAt { get; set; }

        [FirestoreProperty("likes")]
        public int Likes { get; set; }

        [FirestoreProperty("isEdited")]
        public bool IsEdited { get; set; }
    }
} 