using Google.Cloud.Firestore;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;

namespace Lithuaningo.API.Services
{
    public class UserService : IUserService
    {
        private readonly FirestoreDb _db;
        private readonly string _collectionName;

        public UserService(
            FirestoreDb db, 
            IOptions<FirestoreCollectionSettings> collectionSettings)
        {
            _db = db ?? throw new ArgumentNullException(nameof(db));
            _collectionName = collectionSettings.Value.Users;
        }

        public async Task<UserProfile> GetUserProfileAsync(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentNullException(nameof(userId));

            var doc = await _db.Collection(_collectionName)
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

            await _db.Collection(_collectionName)
                .Document(userProfile.Id)
                .SetAsync(userProfile);
        }

        public async Task CreateUserProfileAsync(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentNullException(nameof(userId));

            var userProfile = new UserProfile { Id = userId };
            await UpdateUserProfileAsync(userProfile);
        }

        public async Task DeleteUserProfileAsync(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentNullException(nameof(userId));

            await _db.Collection(_collectionName)
                .Document(userId)
                .DeleteAsync();
        }
    }
}
