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

    [FirestoreProperty("learnedSentences")]
    public List<string> LearnedSentences { get; set; } = new();

    [FirestoreProperty("currentStreak")]
    public int CurrentStreak { get; set; }

    [FirestoreProperty("longestStreak")]
    public int LongestStreak { get; set; }

    [FirestoreProperty("minutesSpentToday")]
    public int MinutesSpentToday { get; set; }

    [FirestoreProperty("minutesSpentTotal")]
    public int MinutesSpentTotal { get; set; }

    [FirestoreProperty("todayAnsweredQuestions")]
    public int TodayAnsweredQuestions { get; set; }

    [FirestoreProperty("todayCorrectAnsweredQuestions")]
    public int TodayCorrectAnsweredQuestions { get; set; }

    [FirestoreProperty("todayWrongAnsweredQuestions")]
    public int TodayWrongAnsweredQuestions { get; set; }

    [FirestoreProperty("totalAnsweredQuestions")]
    public int TotalAnsweredQuestions { get; set; }

    [FirestoreProperty("weeklyCorrectAnswers")]
    public int WeeklyCorrectAnswers { get; set; }

    [FirestoreProperty("lastCompleted")]
    public Timestamp LastCompleted { get; set; }
}