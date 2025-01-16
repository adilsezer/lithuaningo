using Google.Cloud.Firestore;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;

namespace Lithuaningo.API.Services
{
    public class UserService : IUserService
    {
        private readonly FirestoreDb _db;
        private readonly string _collectionName;
        private readonly ISentenceService _sentenceService;
        private readonly IRandomGenerator _randomGenerator;

        public UserService(
            FirestoreDb db, 
            IOptions<FirestoreCollectionSettings> collectionSettings,
            ISentenceService sentenceService,
            IRandomGenerator randomGenerator)
        {
            _db = db ?? throw new ArgumentNullException(nameof(db));
            _collectionName = collectionSettings.Value.Users;
            _sentenceService = sentenceService ?? throw new ArgumentNullException(nameof(sentenceService));
            _randomGenerator = randomGenerator ?? throw new ArgumentNullException(nameof(randomGenerator));
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

        public async Task AddUserLearnedSentencesAsync(string userId, List<string> sentenceIds)
        {
            var user = await GetUserProfileAsync(userId);
            user.LearnedSentences.AddRange(sentenceIds);
            await UpdateUserProfileAsync(user);
        }

        public async Task<List<Sentence>> GetLearnedSentencesAsync(string userId)
        {
            var user = await GetUserProfileAsync(userId);
            return await _sentenceService.GetSentencesByIdsAsync(user.LearnedSentences);
        }

        public async Task<List<Sentence>> GetLastNLearnedSentencesAsync(string userId, int count)
        {
            var user = await GetUserProfileAsync(userId);
            var lastNIds = user.LearnedSentences?.TakeLast(count).ToList() ?? new List<string>();
            return await _sentenceService.GetSentencesByIdsAsync(lastNIds);
        }

        public async Task<Sentence> GetRandomLearnedSentenceAsync(string userId)
        {
            var user = await GetUserProfileAsync(userId);
            var learnedSentenceIds = user.LearnedSentences;
            if (learnedSentenceIds == null || !learnedSentenceIds.Any())
                throw new Exception("User has no learned sentences");

            var randomId = learnedSentenceIds[_randomGenerator.Next(learnedSentenceIds.Count)];
            var sentences = await _sentenceService.GetSentencesByIdsAsync(new List<string> { randomId });
            return sentences.FirstOrDefault() ?? throw new Exception("Sentence not found");
        }

        public async Task CreateUserProfileAsync(string userId)
        {
            await _db.Collection(_collectionName)
                .Document(userId)
                .SetAsync(new UserProfile { Id = userId });
        }

        public async Task DeleteUserProfileAsync(string userId)
        {
            try
            {
                var docRef = _db.Collection(_collectionName).Document(userId);
                await docRef.DeleteAsync();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error deleting user profile: {ex.Message}");
                throw;
            }
        }
    }
}
