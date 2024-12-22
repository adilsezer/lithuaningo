namespace Services.Quiz.Generators;

public class FillInBlankQuestionGenerator : BaseQuestionGenerator
{
    public FillInBlankQuestionGenerator(IWordService wordService) : base(wordService) { }

    public override Task<QuizQuestion> GenerateQuestion(
        Sentence sentence,
        string userId,
        Dictionary<string, WordForm> wordFormsCache)
    {
        var missingWord = GetRandomValidWord(sentence.Text, wordFormsCache);

        var question = new QuizQuestion
        {
            QuestionType = QuestionType.FillInTheBlank,
            QuestionText = "Fill in the blank in the following sentence:",
            SentenceText = ReplaceWholeWord(sentence.Text, missingWord.Word, "_____"),
            CorrectAnswer = missingWord.Word,
            Options = []
        };

        return Task.FromResult(question);
    }

    private static string ReplaceWholeWord(string text, string wordToReplace, string replacement)
    {
        return System.Text.RegularExpressions.Regex.Replace(
            text,
            $@"\b{wordToReplace}\b",
            replacement,
            System.Text.RegularExpressions.RegexOptions.IgnoreCase
        );
    }
}