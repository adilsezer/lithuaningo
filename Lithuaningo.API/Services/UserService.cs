using Google.Cloud.Firestore;
public class UserService
{
    private readonly FirestoreDb _db;

    public UserService(FirestoreDb db)
    {
        _db = db;
    }

    public async Task<UserProfile> GetUserProfileAsync(string userId)
    {
        var doc = await _db.Collection("users").Document(userId).GetSnapshotAsync();
        return doc.Exists ? doc.ConvertTo<UserProfile>() : null;
    }

    public async Task UpdateUserProfileAsync(UserProfile userProfile)
    {
        await _db.Collection("users").Document(userProfile.Id).SetAsync(userProfile);
    }
}