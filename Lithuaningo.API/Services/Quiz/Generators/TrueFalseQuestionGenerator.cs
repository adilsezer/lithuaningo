namespace Services.Quiz.Generators;

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

    public TrueFalseQuestionGenerator(IWordService wordService) : base(wordService) { }

    public override async Task<QuizQuestion> GenerateQuestion(
        Sentence sentence,
        string userId,
        Dictionary<string, WordForm> wordFormsCache)
    {
        var isTrue = Random.Next(2) == 0;
        var (word, translation, enAttributes, partOfSpeech, differentProperties) =
            await GetWordAndTranslation(sentence.Text, isTrue, wordFormsCache);

        // For false questions, only select from templates that match our different properties
        var availableTemplates = isTrue
            ? QuestionTemplates
            : QuestionTemplates.Where((t, index) =>
                (index == 0 && differentProperties.HasFlag(DifferentProperties.Translation)) ||
                (index == 1 && differentProperties.HasFlag(DifferentProperties.Attributes)) ||
                (index == 2 && differentProperties.HasFlag(DifferentProperties.PartOfSpeech)))
                .ToArray();

        var templateIndex = Random.Next(availableTemplates.Length);
        var (_, formatFunc) = availableTemplates[templateIndex];

        return new QuizQuestion
        {
            QuestionType = QuestionType.TrueFalse,
            QuestionText = formatFunc(word, translation, enAttributes, partOfSpeech),
            SentenceText = sentence.Text,
            CorrectAnswer = isTrue ? "True" : "False",
            Options = ["True", "False"]
        };
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

        // Helper function to validate word properties
        bool IsValidWord(WordForm word, Lemma lemma) =>
            !string.IsNullOrEmpty(word.EnAttributes) &&
            !string.IsNullOrEmpty(lemma.Translation) &&
            !string.IsNullOrEmpty(lemma.PartOfSpeech);

        // Get valid correct word
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

            // Skip invalid words
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

        // Fallback: modify the translation to ensure it's false
        return (correctWord.Word, correctLemma.Translation + " (not)", correctWord.EnAttributes, correctLemma.PartOfSpeech, DifferentProperties.Translation);
    }
}
