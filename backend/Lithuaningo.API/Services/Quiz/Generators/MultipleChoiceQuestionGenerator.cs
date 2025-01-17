using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Services.Quiz.Interfaces;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services.Quiz.Generators;

public struct MultipleChoiceFormat
{
    public string Template;
    public Func<Lemma, WordForm, string> GetAnswer;
    public string Type;
}

public class MultipleChoiceQuestionGenerator : BaseQuestionGenerator
{
    private readonly IUserService _userService;
    private readonly MultipleChoiceFormat[] _multipleChoiceFormats;

    public MultipleChoiceQuestionGenerator(
        IWordService wordService,
        IUserService userService,
        IRandomGenerator randomGenerator) : base(wordService, randomGenerator)
    {
        _userService = userService;
        _multipleChoiceFormats = InitializeMultipleChoiceFormats();
    }

    private MultipleChoiceFormat[] InitializeMultipleChoiceFormats() => new[]
    {
        CreateMultipleChoiceFormat(
            "What does the word '{0}' mean in this sentence?",
            (lemma, word) => CombineTranslationAndAttributes(lemma.Translation, word.EnAttributes),
            "translation"),
        CreateMultipleChoiceFormat(
            "What is the grammatical form of '{0}' in this sentence?",
            (_, word) => word.EnAttributes,
            "form"),
        CreateMultipleChoiceFormat(
            "What part of speech is '{0}' in this sentence?",
            (lemma, _) => lemma.PartOfSpeech,
            "pos")
    };

    private static MultipleChoiceFormat CreateMultipleChoiceFormat(
        string template,
        Func<Lemma, WordForm, string> getAnswer,
        string type) => new()
        {
            Template = template,
            GetAnswer = getAnswer,
            Type = type
        };

    private static string CombineTranslationAndAttributes(string translation, string attributes)
    {
        return string.IsNullOrWhiteSpace(attributes)
            ? translation
            : $"{translation} ({attributes})";
    }

    public override async Task<QuizQuestion> GenerateQuestion(
        string userId,
        Dictionary<string, WordForm> wordFormsCache)
    {
        // to be implemented
        return await Task.FromResult(new QuizQuestion());
    }

    private async Task<List<string>> GenerateOptions(
        string sentence,
        WordForm word,
        string correctAnswer,
        string userId,
        Dictionary<string, WordForm> wordFormsCache,
        string questionType)
    {
        // to be implemented
        return await Task.FromResult(new List<string>());
    }


    private async Task<(MultipleChoiceFormat, WordForm, Lemma)> PrepareQuestionComponents(
        Dictionary<string, WordForm> wordFormsCache)
    {
        // to be implemented
        return await Task.FromResult((new MultipleChoiceFormat(), new WordForm(), new Lemma()));
    }
}
