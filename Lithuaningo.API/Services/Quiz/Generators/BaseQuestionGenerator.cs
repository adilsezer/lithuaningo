using Lithuaningo.API.Utilities;
using Services.Quiz.Interfaces;

namespace Services.Quiz.Generators;

public abstract class BaseQuestionGenerator : IQuestionGenerator
{
    protected readonly Random Random = new();
    protected readonly IWordService _wordService;

    protected BaseQuestionGenerator(IWordService wordService)
    {
        _wordService = wordService;
    }

    public abstract Task<QuizQuestion> GenerateQuestion(
        Sentence sentence,
        string userId,
        Dictionary<string, WordForm> wordFormsCache);

    protected WordForm GetRandomValidWord(string sentence, Dictionary<string, WordForm> wordFormsCache, string? excludeWord = null)
    {
        var words = TextUtilities.GetSanitizedWords(sentence)
            .Where(w => !TextUtilities.IsExcludedWord(w))
            .Where(w => wordFormsCache.ContainsKey(w))
            .Where(w => w != excludeWord)
            .OrderBy(_ => Random.Next())
            .ToList();

        return words.Any()
            ? wordFormsCache[words.First()]
            : throw new InvalidOperationException($"No valid word found in sentence: {sentence}");
    }

    protected async Task<Lemma> GetLemmaForWord(WordForm wordForm)
    {
        var lemma = await _wordService.GetLemma(wordForm.LemmaId);
        return lemma ?? throw new InvalidOperationException($"Lemma not found for lemma ID: {wordForm.LemmaId}");
    }
}
