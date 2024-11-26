using Google.Cloud.Firestore;

public class SentenceService
{
    private readonly FirestoreDb _db;

    public SentenceService(FirestoreDb db)
    {
        _db = db;
    }

    public async Task<List<Sentence>> GetSentencesAsync()
    {
        var sentences = await _db.Collection("sentences").GetSnapshotAsync();
        return sentences.Documents.Select(doc => doc.ConvertTo<Sentence>()).ToList();
    }
}
