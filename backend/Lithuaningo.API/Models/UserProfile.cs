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

    [FirestoreProperty("todayAnsweredQuestions")]
    public int TodayAnsweredQuestions { get; set; } = 0;

    [FirestoreProperty("todayCorrectAnsweredQuestions")]
    public int TodayCorrectAnsweredQuestions { get; set; } = 0;

    [FirestoreProperty("lastCompleted")]
    public Timestamp LastCompleted { get; set; } = Timestamp.FromDateTime(DateTime.UtcNow);

    [FirestoreProperty("isAdmin")]
    public bool IsAdmin { get; set; } = false;

    [FirestoreProperty("hasPurchasedExtraContent")]
    public bool HasPurchasedExtraContent { get; set; } = false;
}