using Google.Cloud.Firestore;

[FirestoreData]
public class Sentence
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("displayOrder")]
    public int DisplayOrder { get; set; }

    [FirestoreProperty("englishTranslation")]
    public string EnglishTranslation { get; set; } = string.Empty;

    [FirestoreProperty("isMainSentence")]
    public bool IsMainSentence { get; set; }

    [FirestoreProperty("sentence")]
    public string Text { get; set; } = string.Empty;
}