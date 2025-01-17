using Google.Cloud.Firestore;

[FirestoreData]
public class UserProfile
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("name")]
    public string Name { get; set; } = string.Empty;

    [FirestoreProperty("email")]
    public string Email { get; set; } = string.Empty;

    [FirestoreProperty("emailVerified")]
    public bool EmailVerified { get; set; } = false;

    [FirestoreProperty("isAdmin")]
    public bool IsAdmin { get; set; } = false;

    [FirestoreProperty("hasPurchasedExtraContent")]
    public bool HasPurchasedExtraContent { get; set; } = false;
}