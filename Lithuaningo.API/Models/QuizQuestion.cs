public class QuizQuestion
{
    public QuestionType QuestionType { get; set; }
    public string QuestionText { get; set; }
    public string SentenceText { get; set; }
    public string CorrectAnswer { get; set; }
    public List<string> Options { get; set; } // For Multiple Choice and True/False
}
