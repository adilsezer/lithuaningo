using Google.Cloud.Firestore;

namespace Lithuaningo.API.Models;

[FirestoreData]
public class LeaderboardWeek
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;  // YYYY-WW format

    [FirestoreProperty("startDate", ConverterType = typeof(TimestampConverter))]
    public DateTime StartDate { get; set; } = DateTime.UtcNow;

    [FirestoreProperty("endDate", ConverterType = typeof(TimestampConverter))]
    public DateTime EndDate { get; set; } = DateTime.UtcNow;

    [FirestoreProperty("entries")]
    public Dictionary<string, LeaderboardEntry> Entries { get; set; } = new();
}

[FirestoreData]
public class LeaderboardEntry
{
    [FirestoreProperty("name")]
    public string Name { get; set; } = string.Empty;

    [FirestoreProperty("score")]
    public int Score { get; set; }

    [FirestoreProperty("rank")]
    public int Rank { get; set; }

    [FirestoreProperty("lastUpdated", ConverterType = typeof(TimestampConverter))]
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
} 