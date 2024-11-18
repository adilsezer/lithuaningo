using Google.Cloud.Firestore;

public class WordService
{
    private readonly FirestoreDb _db;

    public WordService(FirestoreDb db)
    {
        _db = db;
    }

    public async Task<List<Word>> FetchWordsAsync()
    {
        var snapshot = await _db.Collection("words").GetSnapshotAsync();
        return snapshot.Documents.Select(doc => doc.ConvertTo<Word>()).ToList();
    }

    public async Task AddWordForReviewAsync(Word word)
    {
        await _db.Collection("pending_words").AddAsync(word);
    }

    public async Task AddMissingWordAsync(string word)
    {
        var docRef = _db.Collection("missing_words").Document(word);
        var doc = await docRef.GetSnapshotAsync();
        if (!doc.Exists)
        {
            await docRef.SetAsync(new { Id = word });
        }
    }
}