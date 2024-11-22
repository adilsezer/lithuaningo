using Google.Cloud.Firestore;

public class StatsService
{
    private readonly FirestoreDb _db;

    public StatsService(FirestoreDb db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Stats?> FetchStatsAsync(string userId)
    {
        if (string.IsNullOrEmpty(userId))
            throw new ArgumentNullException(nameof(userId));

        var doc = await _db.Collection("users").Document(userId).GetSnapshotAsync();
        return doc.Exists ? doc.ConvertTo<Stats>() : default;
    }

    public async Task UpdateUserStatsAsync(string userId, Stats stats)
    {
        if (string.IsNullOrEmpty(userId))
            throw new ArgumentNullException(nameof(userId));
        
        if (stats == null)
            throw new ArgumentNullException(nameof(stats));

        await _db.Collection("users").Document(userId).SetAsync(stats);
    }
}