using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Services.Quiz.Factory;
using Lithuaningo.API.Services.Quiz.Interfaces;
using Lithuaningo.API.Utilities;

namespace Lithuaningo.API.Services.Quiz;

public class QuizService : IQuizService
{
    private readonly IUserService _userService;
    private readonly IWordService _wordService;
    private readonly IQuestionGeneratorFactory _questionGeneratorFactory;
    private readonly IRandomGenerator _randomGenerator;

    public QuizService(
        IUserService userService,
        IWordService wordService,
        IQuestionGeneratorFactory questionGeneratorFactory,
        IRandomGenerator randomGenerator)
    {
        _userService = userService;
        _wordService = wordService;
        _questionGeneratorFactory = questionGeneratorFactory;
        _randomGenerator = randomGenerator;
    }

    public async Task<List<QuizQuestion>> GenerateQuizAsync(string userId)
    {
        var sentences = await _userService.GetLastNLearnedSentencesAsync(userId, 6);
        var (primarySentences, secondarySentences) = SplitSentences(sentences);

        var allSentences = primarySentences.Concat(secondarySentences).Distinct();
        var wordFormsCache = await BuildWordFormsCache(allSentences);

        var primaryQuestions = await GenerateQuestionsForSentences(
            primarySentences,
            6,
            userId,
            wordFormsCache);

        var secondaryQuestions = await GenerateQuestionsForSentences(
            secondarySentences,
            4,
            userId,
            wordFormsCache);

        return primaryQuestions.Concat(secondaryQuestions).ToList();
    }

    private (List<Sentence> Primary, List<Sentence> Secondary) SplitSentences(List<Sentence> sentences)
    {
        var primarySentences = sentences.Take(2).ToList();
        var secondarySentences = sentences.Skip(2).Take(4).ToList();

        if (!secondarySentences.Any())
        {
            secondarySentences = primarySentences;
        }

        return (primarySentences, secondarySentences);
    }

    private async Task<Dictionary<string, WordForm>> BuildWordFormsCache(IEnumerable<Sentence> sentences)
    {
        var uniqueWords = sentences
            .SelectMany(s => TextUtilities.GetSanitizedWords(s.Text))
            .Where(w => !TextUtilities.IsExcludedWord(w))
            .Distinct();

        var wordForms = new Dictionary<string, WordForm>();
        foreach (var word in uniqueWords)
        {
            var wordForm = await _wordService.GetWordForm(word);
            if (wordForm != null)
            {
                wordForms[word] = wordForm;
            }
        }
        return wordForms;
    }

    private async Task<List<QuizQuestion>> GenerateQuestionsForSentences(
        List<Sentence> sentences,
        int questionCount,
        string userId,
        Dictionary<string, WordForm> wordFormsCache)
    {
        var questionTypes = GenerateQuestionTypes(questionCount);
        var questions = new List<QuizQuestion>();

        for (int i = 0; i < questionCount; i++)
        {
            var sentence = sentences[i % sentences.Count];
            var questionType = questionTypes[i];

            try
            {
                var generator = _questionGeneratorFactory.Create(questionType);
                var question = await generator.GenerateQuestion(sentence, userId, wordFormsCache);
                questions.Add(question);
            }
            catch
            {
                var fallbackGenerator = _questionGeneratorFactory.Create(QuestionType.ReorderWords);
                var fallbackQuestion = await fallbackGenerator.GenerateQuestion(sentence, userId, wordFormsCache);
                questions.Add(fallbackQuestion);
            }
        }

        return questions;
    }

    private List<QuestionType> GenerateQuestionTypes(int count)
    {
        var baseTypes = new Dictionary<QuestionType, int>
        {
            { QuestionType.MultipleChoice, 1 },
            { QuestionType.FillInTheBlank, 1 },
            { QuestionType.ReorderWords, 1 },
            { QuestionType.TrueFalse, 1 }
        };

        var types = new List<QuestionType>();

        foreach (var (type, baseCount) in baseTypes)
        {
            types.AddRange(Enumerable.Repeat(type, Math.Min(baseCount, count)));
        }

        var remaining = count - types.Count;
        var availableTypes = Enum.GetValues<QuestionType>().ToList();

        for (int i = 0; i < remaining; i++)
        {
            types.Add(availableTypes[i % availableTypes.Count]);
        }

        return types.OrderBy(_ => _randomGenerator.Next(availableTypes.Count)).ToList();
    }
}