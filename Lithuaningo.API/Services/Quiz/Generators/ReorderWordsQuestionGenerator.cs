using Lithuaningo.API.Utilities;

namespace Services.Quiz.Generators;

public class ReorderWordsQuestionGenerator : BaseQuestionGenerator
{
    public ReorderWordsQuestionGenerator(IWordService wordService) : base(wordService) { }

    public override Task<QuizQuestion> GenerateQuestion(
        Sentence sentence,
        string userId,
        Dictionary<string, WordForm> wordFormsCache)
    {
        var words = TextUtilities.GetSanitizedWords(sentence.Text);
        var shuffledWords = words.OrderBy(_ => Random.Next()).ToList();

        var question = new QuizQuestion
        {
            QuestionType = QuestionType.ReorderWords,
            QuestionText = "Put the words in the correct order:",
            SentenceText = string.Join(" ", shuffledWords),
            CorrectAnswer = string.Join(" ", words),
            Options = new List<string>()
        };

        return Task.FromResult(question);
    }
}
