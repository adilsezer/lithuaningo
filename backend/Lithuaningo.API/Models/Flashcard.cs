using Google.Cloud.Firestore;
using System;

[FirestoreData]
public class Flashcard
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("deckId")]
    public string DeckId { get; set; } = string.Empty;

    [FirestoreProperty("front")]
    public string Front { get; set; } = string.Empty;

    [FirestoreProperty("back")]
    public string Back { get; set; } = string.Empty;

    [FirestoreProperty("audioUrl")]
    public string? AudioUrl { get; set; }

    [FirestoreProperty("imageUrl")]
    public string? ImageUrl { get; set; }

    [FirestoreProperty("exampleSentence")]
    public string? ExampleSentence { get; set; }

    [FirestoreProperty("createdBy")]
    public string CreatedBy { get; set; } = string.Empty;

    [FirestoreProperty("createdAt")]
    public DateTime CreatedAt { get; set; }
} 