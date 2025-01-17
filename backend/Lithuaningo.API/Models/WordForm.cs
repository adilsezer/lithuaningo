using Google.Cloud.Firestore;
using System.Collections.Generic;

namespace Lithuaningo.API.Models;

[FirestoreData]
public class WordForm
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("word")]
    public string Word { get; set; } = string.Empty;

    [FirestoreProperty("lemmaId")]
    public string LemmaId { get; set; } = string.Empty;

    [FirestoreProperty("ltAttributes")]
    public string LtAttributes { get; set; } = string.Empty;

    [FirestoreProperty("enAttributes")]
    public string EnAttributes { get; set; } = string.Empty;

    [FirestoreProperty("notes")]
    public List<string> Notes { get; set; } = new List<string>();
}