using Google.Cloud.Firestore;

[FirestoreData]
public class Lemma
{
    // lemma	part_of_speech	translation	definitions	ipa	examples	image_url	audio_url	notes
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("lemma")]
    public string Lemma_Text { get; set; } = string.Empty;

    [FirestoreProperty("part_of_speech")]
    public string PartOfSpeech { get; set; } = string.Empty;

    [FirestoreProperty("translation")]
    public string Translation { get; set; } = string.Empty;

    [FirestoreProperty("definitions")]
    public List<string> Definitions { get; set; } = new List<string>();

    [FirestoreProperty("ipa")]
    public string Ipa { get; set; } = string.Empty;

    [FirestoreProperty("examples")]
    public List<string> Examples { get; set; } = new List<string>();
    
    [FirestoreProperty("image_url")]
    public string ImageUrl { get; set; } = string.Empty;

    [FirestoreProperty("audio_url")]
    public string AudioUrl { get; set; } = string.Empty;

    [FirestoreProperty("notes")]
    public List<string> Notes { get; set; } = new List<string>();
}