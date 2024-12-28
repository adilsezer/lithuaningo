using Google.Cloud.Firestore;
using Lithuaningo.API.Services.Interfaces;

public class LeaderboardService : ILeaderboardService
{
    private readonly FirestoreDb _db;

    public LeaderboardService(FirestoreDb db)
    {
        _db = db;
    }

    public async Task<List<LeaderboardEntry>> GetLeaderboardEntriesAsync()
    {
        var snapshot = await _db.Collection("leaderboard").GetSnapshotAsync();
        return snapshot.Documents.Select(doc => doc.ConvertTo<LeaderboardEntry>()).ToList();
    }

    public async Task AddLeaderboardEntryAsync(LeaderboardEntry entry)
    {
        var leaderboardCollection = _db.Collection("leaderboard");
        var existingEntryQuery = await leaderboardCollection
            .WhereEqualTo("UserId", entry.Id)
            .Limit(1)
            .GetSnapshotAsync();

        var existingEntry = existingEntryQuery.Documents.FirstOrDefault();
        
        if (existingEntry != null)
        {
            var currentScore = existingEntry.GetValue<int>("Score");
            await leaderboardCollection
                .Document(existingEntry.Id)
                .UpdateAsync(new Dictionary<string, object>
                {
                    { "Score", currentScore + entry.Score },
                    { "Name", entry.Name }
                });
        }
        else
        {
            await leaderboardCollection.AddAsync(entry);
        }
    }

    public async Task ResetLeaderboardAsync()
    {
        const int batchSize = 500;
        CollectionReference collection = _db.Collection("leaderboard");
        
        while (true)
        {
            var snapshot = await collection.Limit(batchSize).GetSnapshotAsync();
            if (!snapshot.Documents.Any()) break;
            
            var batch = _db.StartBatch();
            foreach (var doc in snapshot.Documents)
            {
                batch.Delete(doc.Reference);
            }
            await batch.CommitAsync();
        }
    }
}