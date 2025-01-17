using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Services.Quiz.Interfaces;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services.Quiz.Generators;

public class FillInBlankQuestionGenerator : BaseQuestionGenerator
{
    public FillInBlankQuestionGenerator(IWordService wordService, IRandomGenerator randomGenerator)
        : base(wordService, randomGenerator) { }

    public override Task<QuizQuestion> GenerateQuestion(
        string userId,
        Dictionary<string, WordForm> wordFormsCache)
    {
        // to be implemented
        return Task.FromResult(new QuizQuestion());
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