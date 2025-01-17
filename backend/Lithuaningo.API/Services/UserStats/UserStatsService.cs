using Google.Cloud.Firestore;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;

namespace Lithuaningo.API.Services
{
    public class UserStatsService : IUserStatsService
    {
        private readonly FirestoreDb _db;
        private readonly string _collectionName;
        private readonly IRandomGenerator _randomGenerator;
        private const int BASE_EXPERIENCE_PER_LEVEL = 100;
        private const int EXPERIENCE_MULTIPLIER = 2;

        public UserStatsService(
            FirestoreDb db,
            IOptions<FirestoreCollectionSettings> collectionSettings,
            IRandomGenerator randomGenerator)
        {
            _db = db ?? throw new ArgumentNullException(nameof(db));
            _collectionName = collectionSettings.Value.UserStats;
            _randomGenerator = randomGenerator ?? throw new ArgumentNullException(nameof(randomGenerator));
        }

        public async Task<UserStats> GetUserStatsAsync(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentNullException(nameof(userId));

            var doc = await _db.Collection(_collectionName)
                .Document(userId)
                .GetSnapshotAsync();

            if (!doc.Exists)
                throw new Exception("User stats not found");

            return doc.ConvertTo<UserStats>();
        }

        public async Task UpdateUserStatsAsync(UserStats userStats)
        {
            if (userStats == null)
                throw new ArgumentNullException(nameof(userStats));

            if (string.IsNullOrEmpty(userStats.UserId))
                throw new ArgumentException("User ID cannot be null or empty", nameof(userStats));

            await _db.Collection(_collectionName)
                .Document(userStats.UserId)
                .SetAsync(userStats);
        }

        public async Task CreateUserStatsAsync(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentNullException(nameof(userId));

            var userStats = new UserStats { UserId = userId };
            await UpdateUserStatsAsync(userStats);
        }

        public async Task UpdateDailyStreakAsync(string userId)
        {
            var userStats = await GetUserStatsAsync(userId);
            var lastUpdate = userStats.LastStreakUpdate.Date;
            var today = DateTime.UtcNow.Date;

            if (lastUpdate == today)
                return;

            if (lastUpdate == today.AddDays(-1))
            {
                // Streak continues
                userStats.DailyStreak++;
            }
            else
            {
                // Streak broken
                userStats.DailyStreak = 1;
            }
            userStats.LastStreakUpdate = DateTime.UtcNow;
            await UpdateUserStatsAsync(userStats);
        }

        public async Task AddExperiencePointsAsync(string userId, int amount)
        {
            var userStats = await GetUserStatsAsync(userId);
            userStats.ExperiencePoints += amount;

            // Level up if enough experience
            int experienceNeeded = CalculateExperienceForNextLevel(userStats.Level);
            while (userStats.ExperiencePoints >= experienceNeeded)
            {
                userStats.Level++;
                userStats.ExperiencePoints -= experienceNeeded;
                // Calculate next level requirement
                experienceNeeded = CalculateExperienceForNextLevel(userStats.Level);
            }
            await UpdateUserStatsAsync(userStats);
        }

        private int CalculateExperienceForNextLevel(int currentLevel)
        {
            return BASE_EXPERIENCE_PER_LEVEL + (currentLevel - 1) * EXPERIENCE_MULTIPLIER * BASE_EXPERIENCE_PER_LEVEL;
        }

        public async Task AddLearnedWordAsync(string userId, string wordId)
        {
            var userStats = await GetUserStatsAsync(userId);
            if (!userStats.LearnedWordIds.Contains(wordId))
            {
                userStats.LearnedWordIds.Add(wordId);
                userStats.TotalWordsLearned = userStats.LearnedWordIds.Count;
                await UpdateUserStatsAsync(userStats);
            }
        }

        public async Task IncrementTotalQuizzesCompletedAsync(string userId)
        {
            var userStats = await GetUserStatsAsync(userId);
            userStats.TotalQuizzesCompleted++;
            await UpdateUserStatsAsync(userStats);
        }
    }
} 