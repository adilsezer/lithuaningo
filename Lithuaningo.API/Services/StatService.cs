using Google.Cloud.Firestore;

public class StatsService
{
    private readonly FirestoreDb _db;

    public StatsService(FirestoreDb db)
    {
        _db = db;
    }

    public async Task<Stats> FetchStatsAsync(string userId)
    {
        var doc = await _db.Collection("users").Document(userId).GetSnapshotAsync();
        return doc.Exists ? doc.ConvertTo<Stats>() : null;
    }

    public async Task UpdateUserStatsAsync(string userId, Stats stats)
    {
        await _db.Collection("users").Document(userId).SetAsync(stats);
    }
}