

using Google.Cloud.Firestore;
using Lithuaningo.API.Services.Interfaces;

public class LeaderboardService : ILeaderboardService
{
    private readonly FirestoreDb _db;

    public LeaderboardService(FirestoreDb db)
    {
        _db = db;
    }

    public async Task<List<Leaderboard>> GetLeaderboardAsync()
    {
        var snapshot = await _db.Collection("leaderboard").GetSnapshotAsync();
        return snapshot.Documents.Select(doc => doc.ConvertTo<Leaderboard>()).ToList();
    }
}