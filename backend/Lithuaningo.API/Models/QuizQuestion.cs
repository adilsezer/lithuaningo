public class QuizQuestion
{
    public QuestionType QuestionType { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string SentenceText { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
}
