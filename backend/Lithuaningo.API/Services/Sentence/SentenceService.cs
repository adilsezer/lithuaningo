using Google.Cloud.Firestore;

public class SentenceService : ISentenceService
{
    private readonly FirestoreDb _db;
    private readonly IRandomGenerator _randomGenerator;
    private const string SENTENCE_COUNT_DOC = "metadata/sentence_count";

    public SentenceService(FirestoreDb db, IRandomGenerator randomGenerator)
    {
        _db = db;
        _randomGenerator = randomGenerator;
    }

    public async Task<List<Sentence>> GetSentencesByIdsAsync(List<string> sentenceIds, int limit = 50)
    {
        if (sentenceIds == null || !sentenceIds.Any())
            return new List<Sentence>();

        var batch = _db.Collection("sentences").WhereIn(FieldPath.DocumentId, sentenceIds.Take(limit));
        var querySnapshot = await batch.GetSnapshotAsync();

        return querySnapshot
            .Select(snap => snap.ConvertTo<Sentence>())
            .ToList();
    }

    public async Task<Sentence> GetRandomSentenceAsync()
    {
        var randomIndex = _randomGenerator.Next(0, 20);
        var randomDoc = await _db.Collection("sentences")
            .Offset(randomIndex)
            .Limit(1)
            .GetSnapshotAsync();

        return randomDoc.FirstOrDefault()?.ConvertTo<Sentence>() 
            ?? throw new InvalidOperationException("No sentences found in the database.");
    }
}
