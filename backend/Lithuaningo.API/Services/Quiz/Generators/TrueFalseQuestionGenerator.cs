using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Services.Quiz.Interfaces;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services.Quiz.Generators;

public class TrueFalseQuestionGenerator : BaseQuestionGenerator
{
    private static readonly (string Template, Func<string, string, string, string, string> Format)[] QuestionTemplates =
    {
        ("The word '{0}' means '{1}' and is in the {2} form", (word, translation, attributes, __) =>
            string.Format("The word '{0}' means '{1}' and is in the {2} form", word, translation, attributes)),

        ("The grammatical form of '{0}' is {1}", (word, _, attributes, __) =>
            string.Format("The grammatical form of '{0}' is {1}", word, attributes)),

        ("The word '{0}' is a {1}", (word, _, __, partOfSpeech) =>
            string.Format("The word '{0}' is a {1}", word, partOfSpeech))
    };

    public TrueFalseQuestionGenerator(IWordService wordService, IRandomGenerator randomGenerator)
        : base(wordService, randomGenerator) { }

    public override async Task<QuizQuestion> GenerateQuestion(
        string userId,
        Dictionary<string, WordForm> wordFormsCache)
    {
        // to be implemented
        return await Task.FromResult(new QuizQuestion());
    }

    [Flags]
    private enum DifferentProperties
    {
        None = 0,
        Translation = 1,
        Attributes = 2,
        PartOfSpeech = 4
    }

    private async Task<(string Word, string Translation, string EnAttributes, string PartOfSpeech, DifferentProperties DifferentProps)> GetWordAndTranslation(
        string sentence,
        bool isTrue,
        Dictionary<string, WordForm> wordFormsCache)
    {
        const int maxAttempts = 10;

        bool IsValidWord(WordForm word, Lemma lemma) =>
            !string.IsNullOrEmpty(word.EnAttributes) &&
            !string.IsNullOrEmpty(lemma.Translation) &&
            !string.IsNullOrEmpty(lemma.PartOfSpeech);

        WordForm correctWord = GetRandomValidWord(sentence, wordFormsCache);
        Lemma correctLemma = await GetLemmaForWord(correctWord);

        for (int attempt = 1; attempt < maxAttempts; attempt++)
        {
            if (IsValidWord(correctWord, correctLemma))
                break;

            correctWord = GetRandomValidWord(sentence, wordFormsCache);
            correctLemma = await GetLemmaForWord(correctWord);

            if (attempt == maxAttempts - 1)
                throw new InvalidOperationException("Could not find a valid word after maximum attempts");
        }

        if (isTrue)
        {
            return (correctWord.Word, correctLemma.Translation, correctWord.EnAttributes, correctLemma.PartOfSpeech, DifferentProperties.None);
        }

        for (int i = 0; i < maxAttempts; i++)
        {
            var alternativeWord = GetRandomValidWord(sentence, wordFormsCache, excludeWord: correctWord.Word);
            var alternateLemma = await GetLemmaForWord(alternativeWord);

            if (!IsValidWord(alternativeWord, alternateLemma))
                continue;

            var differentProps = DifferentProperties.None;
            if (alternateLemma.Translation != correctLemma.Translation)
                differentProps |= DifferentProperties.Translation;
            if (alternativeWord.EnAttributes != correctWord.EnAttributes)
                differentProps |= DifferentProperties.Attributes;
            if (alternateLemma.PartOfSpeech != correctLemma.PartOfSpeech)
                differentProps |= DifferentProperties.PartOfSpeech;

            if (differentProps != DifferentProperties.None)
            {
                return (correctWord.Word, alternateLemma.Translation, alternativeWord.EnAttributes, alternateLemma.PartOfSpeech, differentProps);
            }
        }

        return (correctWord.Word, correctLemma.Translation + " (not)", correctWord.EnAttributes, correctLemma.PartOfSpeech, DifferentProperties.Translation);
    }
}
