using Google.Cloud.Firestore;
using Lithuaningo.API.Models;

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

    [FirestoreProperty("lastCompleted", ConverterType = typeof(TimestampConverter))]
    public DateTime LastCompleted { get; set; } = DateTime.UtcNow;

    [FirestoreProperty("isAdmin")]
    public bool IsAdmin { get; set; } = false;

    [FirestoreProperty("hasPurchasedExtraContent")]
    public bool HasPurchasedExtraContent { get; set; } = false;
}