using Google.Cloud.Firestore;

[FirestoreData]
public class AppInfo
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("latestVersion")]
    public string LatestVersion { get; set; } = string.Empty;

    [FirestoreProperty("mandatoryUpdate")]
    public bool MandatoryUpdate { get; set; }

    [FirestoreProperty("updateUrl")]
    public string UpdateUrl { get; set; } = string.Empty;

    [FirestoreProperty("isUnderMaintenance")]
    public bool IsUnderMaintenance { get; set; }
}