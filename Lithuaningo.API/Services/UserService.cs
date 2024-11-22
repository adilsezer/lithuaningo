using Google.Cloud.Firestore;
public class UserService
{
    private readonly FirestoreDb _db;

    public UserService(FirestoreDb db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<UserProfile?> GetUserProfileAsync(string userId)
    {
        if (string.IsNullOrEmpty(userId))
            throw new ArgumentNullException(nameof(userId));

        var doc = await _db.Collection("users").Document(userId).GetSnapshotAsync();
        return doc.Exists ? doc.ConvertTo<UserProfile>() : null;
    }

    public async Task UpdateUserProfileAsync(UserProfile userProfile)
    {
        if (userProfile == null)
            throw new ArgumentNullException(nameof(userProfile));

        if (string.IsNullOrEmpty(userProfile.Id))
            throw new ArgumentException("User ID cannot be null or empty", nameof(userProfile));

        await _db.Collection("users").Document(userProfile.Id).SetAsync(userProfile);
    }
}