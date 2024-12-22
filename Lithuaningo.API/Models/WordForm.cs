using Google.Cloud.Firestore;

[FirestoreData]
public class WordForm
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("word")]
    public string Word { get; set; } = string.Empty;

    [FirestoreProperty("lemma_id")]
    public string LemmaId { get; set; } = string.Empty;

    [FirestoreProperty("lt_attributes")]
    public string LtAttributes { get; set; } = string.Empty;

    [FirestoreProperty("en_attributes")]
    public string EnAttributes { get; set; } = string.Empty;

    [FirestoreProperty("notes")]
    public List<string> Notes { get; set; } = new List<string>();
}