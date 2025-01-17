using Google.Cloud.Firestore;
using System;

namespace Lithuaningo.API.Models;

[FirestoreData]
public class DeckVote
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("userId")]
    public string UserId { get; set; } = string.Empty;

    [FirestoreProperty("deckId")]
    public string DeckId { get; set; } = string.Empty;

    [FirestoreProperty("isUpvote")]
    public bool IsUpvote { get; set; }

    [FirestoreProperty("createdAt")]
    public DateTime CreatedAt { get; set; }
} 