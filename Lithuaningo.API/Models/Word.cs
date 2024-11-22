using Google.Cloud.Firestore;

[FirestoreData]
public class Word
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;
    
    [FirestoreProperty]
    public string additionalInfo { get; set; } = string.Empty;

    [FirestoreProperty]
    public string englishTranslation { get; set; } = string.Empty;

    [FirestoreProperty]
    public List<string> grammaticalForms { get; set; } = new();

    [FirestoreProperty]
    public string imageUrl { get; set; } = string.Empty;

    [FirestoreProperty]
    public List<WordForm> wordForms { get; set; } = new();
}

[FirestoreData]
public class WordForm
{
    [FirestoreProperty]
    public string english { get; set; } = string.Empty;

    [FirestoreProperty]
    public string lithuanian { get; set; } = string.Empty;
}