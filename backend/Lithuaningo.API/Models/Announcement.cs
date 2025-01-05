using Google.Cloud.Firestore;

namespace Lithuaningo.API.Models;

[FirestoreData]
public class Announcement
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("title")]
    public string Title { get; set; } = string.Empty;

    [FirestoreProperty("content")]
    public string Content { get; set; } = string.Empty;
}