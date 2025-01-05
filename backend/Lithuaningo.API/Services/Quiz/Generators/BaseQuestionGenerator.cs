using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Services.Quiz.Interfaces;
using Lithuaningo.API.Utilities;

namespace Lithuaningo.API.Services.Quiz.Generators;

public abstract class BaseQuestionGenerator : IQuestionGenerator
{
    protected readonly IRandomGenerator RandomGenerator;
    protected readonly IWordService WordService;

    protected BaseQuestionGenerator(IWordService wordService, IRandomGenerator randomGenerator)
    {
        WordService = wordService;
        RandomGenerator = randomGenerator;
    }

    public abstract Task<QuizQuestion> GenerateQuestion(Sentence sentence, string userId, Dictionary<string, WordForm> wordFormsCache);

    protected WordForm GetRandomValidWord(string sentence, Dictionary<string, WordForm> wordFormsCache, string? excludeWord = null)
    {
        var words = TextUtilities.GetSanitizedWords(sentence)
            .Where(w => !TextUtilities.IsExcludedWord(w))
            .Where(w => wordFormsCache.ContainsKey(w))
            .Where(w => w != excludeWord)
            .OrderBy(_ => RandomGenerator.Next(100))
            .ToList();

        return words.Any()
            ? wordFormsCache[words.First()]
            : throw new InvalidOperationException($"No valid word found in sentence: {sentence}");
    }

    protected async Task<Lemma> GetLemmaForWord(WordForm wordForm)
    {
        var lemma = await WordService.GetLemma(wordForm.LemmaId);
        return lemma ?? throw new InvalidOperationException($"Lemma not found for lemma ID: {wordForm.LemmaId}");
    }
}
