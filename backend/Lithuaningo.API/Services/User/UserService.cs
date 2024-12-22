using Google.Cloud.Firestore;
public class UserService : IUserService
{
    private readonly FirestoreDb _db;

    public UserService(FirestoreDb db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<UserProfile> GetUserProfileAsync(string userId)
    {
        if (string.IsNullOrEmpty(userId))
            throw new ArgumentNullException(nameof(userId));

        var doc = await _db.Collection("userProfiles")
            .Document(userId)
            .GetSnapshotAsync();

        if (!doc.Exists)
            throw new Exception("User not found");

        return doc.ConvertTo<UserProfile>();
    }

    public async Task UpdateUserProfileAsync(UserProfile userProfile)
    {
        if (userProfile == null)
            throw new ArgumentNullException(nameof(userProfile));

        if (string.IsNullOrEmpty(userProfile.Id))
            throw new ArgumentException("User ID cannot be null or empty", nameof(userProfile));

        await _db.Collection("userProfiles")
            .Document(userProfile.Id)
            .SetAsync(userProfile);
    }
}