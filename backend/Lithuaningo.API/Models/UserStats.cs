using Google.Cloud.Firestore;

namespace Lithuaningo.API.Models
{
    [FirestoreData]
    public class UserStats
    {
        [FirestoreDocumentId]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty("level")]
        public int Level { get; set; } = 1;

        [FirestoreProperty("experiencePoints")]
        public int ExperiencePoints { get; set; } = 0;

        [FirestoreProperty("dailyStreak")]
        public int DailyStreak { get; set; } = 0;

        [FirestoreProperty("lastStreakUpdate", ConverterType = typeof(TimestampConverter))]
        public DateTime LastStreakUpdate { get; set; } = DateTime.UtcNow;

        [FirestoreProperty("totalWordsLearned")]
        public int TotalWordsLearned { get; set; } = 0;

        [FirestoreProperty("learnedWordIds")]
        public List<string> LearnedWordIds { get; set; } = new();

        [FirestoreProperty("totalQuizzesCompleted")]
        public int TotalQuizzesCompleted { get; set; } = 0;

        [FirestoreProperty("todayAnsweredQuestions")]
        public int TodayAnsweredQuestions { get; set; } = 0;

        [FirestoreProperty("todayCorrectAnsweredQuestions")]
        public int TodayCorrectAnsweredQuestions { get; set; } = 0;

        [FirestoreProperty("lastActivityTime", ConverterType = typeof(TimestampConverter))]
        public DateTime LastActivityTime { get; set; } = DateTime.UtcNow;
    }
} 