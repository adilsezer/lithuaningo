public class QuizQuestion
{
    public string QuestionText { get; set; } = string.Empty;
    public string SentenceText { get; set; } = string.Empty;
    public string CorrectAnswerText { get; set; } = string.Empty;
    public string Translation { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public string QuestionType { get; set; } = string.Empty;
    public string QuestionWord { get; set; } = string.Empty;
}

public class QuizAnswer
{
    public string UserId { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int TimeSpent { get; set; } // in minutes
}