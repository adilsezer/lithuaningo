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
        Sentence sentence,
        string userId,
        Dictionary<string, WordForm> wordFormsCache)
    {
        const int maxAttempts = 3;
        for (int attempt = 0; attempt < maxAttempts; attempt++)
        {
            var (questionType, validWord, lemma) = await PrepareQuestionComponents(sentence, wordFormsCache);
            var correctAnswer = questionType.GetAnswer(lemma, validWord);

            if (string.IsNullOrWhiteSpace(correctAnswer))
            {
                continue;
            }

            var questionText = string.Format(questionType.Template, validWord.Word);
            var options = await GenerateOptions(
                sentence.Text,
                validWord,
                correctAnswer,
                userId,
                wordFormsCache,
                questionType.Type);

            return new QuizQuestion
            {
                QuestionType = QuestionType.MultipleChoice,
                QuestionText = questionText,
                SentenceText = sentence.Text,
                CorrectAnswer = correctAnswer,
                Options = options
            };
        }

        throw new InvalidOperationException("Could not generate a valid question after multiple attempts");
    }

    private async Task<List<string>> GenerateOptions(
        string sentence,
        WordForm word,
        string correctAnswer,
        string userId,
        Dictionary<string, WordForm> wordFormsCache,
        string questionType)
    {
        var options = new HashSet<string> { correctAnswer };
        const int maxAttempts = 20;

        for (int attempts = 0; attempts < maxAttempts && options.Count < 4; attempts++)
        {
            var (alternativeWord, fromSameSentence) = options.Count == 1
                ? (GetRandomValidWord(sentence, wordFormsCache), true)
                : (await GetRandomWordFromNewSentence(userId, wordFormsCache), false);

            if (fromSameSentence && alternativeWord.Word == word.Word)
                continue;

            var option = await GetOptionByType(alternativeWord, questionType);
            if (!string.IsNullOrWhiteSpace(option))
                options.Add(option);
        }

        for (int i = options.Count + 1; options.Count < 4; i++)
            options.Add($"Option {i}");

        return options.OrderBy(_ => RandomGenerator.Next(100)).ToList();
    }

    private async Task<WordForm> GetRandomWordFromNewSentence(
        string userId,
        Dictionary<string, WordForm> wordFormsCache)
    {
        var randomSentence = await _userService.GetRandomLearnedSentenceAsync(userId);
        return randomSentence != null
            ? GetRandomValidWord(randomSentence.Text, wordFormsCache)
            : throw new InvalidOperationException("No random sentence available");
    }

    private async Task<string> GetOptionByType(WordForm word, string questionType)
    {
        if (questionType == "form")
        {
            return word.EnAttributes;
        }

        var lemma = await GetLemmaForWord(word);
        return questionType switch
        {
            "translation" => CombineTranslationAndAttributes(lemma.Translation, word.EnAttributes),
            "pos" => lemma.PartOfSpeech,
            _ => throw new ArgumentException($"Unknown question type: {questionType}")
        };
    }

    private async Task<(MultipleChoiceFormat, WordForm, Lemma)> PrepareQuestionComponents(
        Sentence sentence,
        Dictionary<string, WordForm> wordFormsCache)
    {
        var validWord = GetRandomValidWord(sentence.Text, wordFormsCache);
        var lemma = await GetLemmaForWord(validWord);

        var choiceFormat = _multipleChoiceFormats[RandomGenerator.Next(_multipleChoiceFormats.Length)];

        return (choiceFormat, validWord, lemma);
    }
}
