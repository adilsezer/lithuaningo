using Google.Cloud.Firestore;

public class SentenceService : ISentenceService
{
    private readonly FirestoreDb _db;

    public SentenceService(FirestoreDb db)
    {
        _db = db;
    }

    public async Task<List<Sentence>> GetSentencesByIdsAsync(List<string> sentenceIds, int limit = 50)
    {
        if (sentenceIds == null || !sentenceIds.Any())
            return new List<Sentence>();

        var tasks = sentenceIds.Take(limit)
            .Select(id => _db.Collection("sentences").Document(id).GetSnapshotAsync());
        var snapshots = await Task.WhenAll(tasks);

        return snapshots
            .Where(snap => snap.Exists)
            .Select(snap => snap.ConvertTo<Sentence>())
            .ToList();
    }
}