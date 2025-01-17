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
        string userId,
        Dictionary<string, WordForm> wordFormsCache)
    {
        // to be implemented
        return Task.FromResult(new QuizQuestion());
    }
}
