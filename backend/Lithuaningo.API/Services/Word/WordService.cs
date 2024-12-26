using Google.Cloud.Firestore;

public class WordService : IWordService
{
    private readonly FirestoreDb _db;

    public WordService(FirestoreDb db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<WordForm?> GetWordForm(string word)
    {
        var snapshot = await _db.Collection("wordForms")
                              .WhereIn("word", new[] {
                                  word.ToLower(),
                                  word.ToUpper(),
                                  char.ToUpper(word[0]) + word.Substring(1).ToLower()
                              })
                              .Limit(1)
                              .GetSnapshotAsync();
        return snapshot.Documents.FirstOrDefault()?.ConvertTo<WordForm>();
    }

    public async Task<Lemma?> GetLemma(string lemma)
    {
        foreach (var variant in new[] {
            lemma.ToLower(),
            lemma.ToUpper(),
            char.ToUpper(lemma[0]) + lemma.Substring(1).ToLower()
        })
        {
            var snapshot = await _db.Collection("lemmas").Document(variant).GetSnapshotAsync();
            if (snapshot.Exists)
            {
                return snapshot.ConvertTo<Lemma>();
            }
        }
        return null;
    }
}