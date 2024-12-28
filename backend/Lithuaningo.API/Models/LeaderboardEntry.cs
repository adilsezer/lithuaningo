using Google.Cloud.Firestore;

[FirestoreData]
public class LeaderboardEntry
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("name")]
    public string Name { get; set; } = string.Empty;

    [FirestoreProperty("score")]
    public int Score { get; set; } = 0;
}