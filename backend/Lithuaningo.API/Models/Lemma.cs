using Google.Cloud.Firestore;
using System.Collections.Generic;

namespace Lithuaningo.API.Models;

[FirestoreData]
public class Lemma
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("lemma")]
    public string LemmaText { get; set; } = string.Empty;

    [FirestoreProperty("partOfSpeech")]
    public string PartOfSpeech { get; set; } = string.Empty;

    [FirestoreProperty("translation")]
    public string Translation { get; set; } = string.Empty;

    [FirestoreProperty("definitions")]
    public List<string> Definitions { get; set; } = new List<string>();

    [FirestoreProperty("ipa")]
    public string Ipa { get; set; } = string.Empty;

    [FirestoreProperty("examples")]
    public List<string> Examples { get; set; } = new List<string>();

    [FirestoreProperty("imageUrl")]
    public string ImageUrl { get; set; } = string.Empty;

    [FirestoreProperty("audioUrl")]
    public string AudioUrl { get; set; } = string.Empty;

    [FirestoreProperty("notes")]
    public List<string> Notes { get; set; } = new List<string>();
}