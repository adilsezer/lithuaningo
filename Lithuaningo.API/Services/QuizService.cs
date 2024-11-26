using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class QuizService
{
    private readonly FirestoreDb _db;
    private readonly HashSet<string> _skippedWords = new(new[]
    {
        "yra", "aš", "buvo", "mano", "ir", "tu", "jis", "ji", 
        "mes", "jie", "jos", "tai", "į"
    }.Select(w => w.ToLower()));

    private const int MAX_SENTENCES_PER_WORD = 2;
    private const int MAX_QUIZ_QUESTIONS = 10;

    public QuizService(FirestoreDb db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<List<QuizQuestion>> LoadQuizDataAsync(string userId)
    {
        ArgumentNullException.ThrowIfNullOrEmpty(userId);

        var (learnedSentences, allWords) = await FetchInitialDataAsync(userId);
        var learnedWordsDetails = ExtractLearnedWordsDetails(learnedSentences, allWords);
        
        return await GenerateQuizQuestionsAsync(learnedWordsDetails);
    }

    private async Task<(List<string> LearnedSentences, List<Word> AllWords)> FetchInitialDataAsync(string userId)
    {
        var learnedSentencesTask = FetchLearnedSentencesAsync(userId);
        var allWordsTask = FetchAllWordsAsync();

        await Task.WhenAll(learnedSentencesTask, allWordsTask);

        return (await learnedSentencesTask, await allWordsTask);
    }

    private async Task<List<string>> FetchLearnedSentencesAsync(string userId)
    {
        var userDoc = await _db.Collection("userProfiles").Document(userId).GetSnapshotAsync();
        if (!userDoc.Exists) return new List<string>();

        var userData = userDoc.ConvertTo<UserProfile>();
        return userData?.LearnedSentences ?? new List<string>();
    }

    private async Task<List<Word>> FetchAllWordsAsync()
    {
        var snapshot = await _db.Collection("words").GetSnapshotAsync();
        return snapshot.Documents
            .Select(doc => doc.ConvertTo<Word>())
            .ToList();
    }

    private List<Word> ExtractLearnedWordsDetails(List<string> learnedSentences, List<Word> allWords)
    {
        var learnedWords = learnedSentences
            .SelectMany(sentence => sentence.Split(' '))
            .Select(word => word.ToLower())
            .Where(word => !_skippedWords.Contains(word))
            .Distinct();

        return learnedWords
            .Select(word => FindWordWithPrefixHandling(word, allWords))
            .Where(word => word != null)
            .ToList()!;
    }

    private Word? FindWordWithPrefixHandling(string word, List<Word> allWords)
    {
        var wordDetail = FindWordDetailsIgnoringPrefix(word, allWords);
        if (wordDetail != null) return wordDetail;

        // Handle "ne" prefix
        if (word.StartsWith("ne") && word.Length > 2)
        {
            return FindWordDetailsIgnoringPrefix(word[2..], allWords);
        }

        return null;
    }

    private Word? FindWordDetailsIgnoringPrefix(string word, List<Word> allWords)
    {
        return allWords.FirstOrDefault(wordDetail =>
            wordDetail.wordForms.Any(form => 
                form.lithuanian.ToLower() == word));
    }

    private async Task<List<QuizQuestion>> GenerateQuizQuestionsAsync(List<Word> learnedWordsDetails)
    {
        var allSentences = await FetchAllSentencesAsync();
        var selectedSentences = SelectRelevantSentences(learnedWordsDetails, allSentences);
        
        return (await Task.WhenAll(
            selectedSentences.Select(sentence => 
                GenerateQuestionAsync(sentence, learnedWordsDetails))
        )).ToList();
    }

    private List<string> SelectRelevantSentences(List<Word> learnedWordsDetails, List<string> allSentences)
    {
        return learnedWordsDetails
            .SelectMany(wordDetail => 
                GetRelatedSentences(allSentences, wordDetail)
                    .Take(MAX_SENTENCES_PER_WORD))
            .Distinct()
            .Take(MAX_QUIZ_QUESTIONS)
            .ToList();
    }

    private async Task<QuizQuestion> GenerateQuestionAsync(string sentence, List<Word> allWords)
    {
        var translation = await TranslateSentenceAsync(sentence);
        var options = GenerateOptions(translation, allWords);

        return new QuizQuestion
        {
            QuestionText = "What does this sentence mean?",
            SentenceText = sentence,
            CorrectAnswerText = translation,
            Translation = translation,
            Options = options,
            QuestionType = "multipleChoice",
            QuestionWord = ExtractMainWord(sentence, allWords)
        };
    }

    private async Task<string> TranslateSentenceAsync(string sentence)
    {
        // TODO: Implement actual translation logic
        var snapshot = await _db.Collection("sentences")
            .WhereEqualTo("lithuanian", sentence)
            .Limit(1)
            .GetSnapshotAsync();

        var doc = snapshot.FirstOrDefault();
        return doc?.GetValue<string>("english") ?? "Translation pending";
    }

    private List<string> GenerateOptions(string correctAnswer, List<Word> allWords)
    {
        // TODO: Implement proper options generation
        var options = new List<string> { correctAnswer };
        // Add distractor options here
        return options;
    }

    private string ExtractMainWord(string sentence, List<Word> allWords)
    {
        // TODO: Implement logic to extract the main word from the sentence
        return sentence.Split(' ').FirstOrDefault() ?? string.Empty;
    }

    private async Task<List<string>> FetchAllSentencesAsync()
    {
        var snapshot = await _db.Collection("sentences").GetSnapshotAsync();
        return snapshot.Documents
            .Select(doc => doc.ConvertTo<Sentence>().Text)
            .ToList();
    }

    private List<string> GetRelatedSentences(List<string> allSentences, Word wordDetail)
    {
        return allSentences
            .Where(sentence => 
                sentence.Contains(wordDetail.englishTranslation, 
                    StringComparison.OrdinalIgnoreCase))
            .ToList();
    }
}