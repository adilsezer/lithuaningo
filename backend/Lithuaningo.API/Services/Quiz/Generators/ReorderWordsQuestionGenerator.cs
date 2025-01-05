using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Utilities;
using Services.Quiz.Interfaces;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services.Quiz.Generators;

public class ReorderWordsQuestionGenerator : BaseQuestionGenerator
{
    public ReorderWordsQuestionGenerator(IWordService wordService, IRandomGenerator randomGenerator)
        : base(wordService, randomGenerator) { }

    public override Task<QuizQuestion> GenerateQuestion(
        Sentence sentence,
        string userId,
        Dictionary<string, WordForm> wordFormsCache)
    {
        var words = TextUtilities.GetSanitizedWords(sentence.Text);
        var shuffledWords = words.OrderBy(_ => RandomGenerator.Next(100)).ToList();

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
