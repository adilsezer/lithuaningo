public class Stats
{
    public int CurrentStreak { get; set; }
    public DateTime LastCompleted { get; set; }
    public int LongestStreak { get; set; }
    public int MinutesSpentToday { get; set; }
    public int MinutesSpentTotal { get; set; }
    public int TodayAnsweredQuestions { get; set; }
    public int TodayCorrectAnsweredQuestions { get; set; }
    public int TodayWrongAnsweredQuestions { get; set; }
    public int TotalAnsweredQuestions { get; set; }
    public int WeeklyCorrectAnswers { get; set; }
}