using Google.Cloud.Firestore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class QuizService
{
    private readonly FirestoreDb _db;

    public QuizService(FirestoreDb db)
    {
        _db = db;
    }

    public async Task<List<QuizQuestion>> LoadQuizDataAsync(string userId)
    {
        var learnedSentences = await FetchLearnedSentencesAsync(userId);
        var allWords = await FetchAllWordsAsync();

        var learnedWordsDetails = GetLearnedWordsDetails(learnedSentences, allWords);
        var quizQuestions = await GenerateQuizQuestionsAsync(learnedWordsDetails, learnedSentences);

        return quizQuestions;
    }

    private async Task<List<string>> FetchLearnedSentencesAsync(string userId)
    {
        var userDoc = await _db.Collection("users").Document(userId).GetSnapshotAsync();
        if (userDoc.Exists)
        {
            var userData = userDoc.ConvertTo<UserProfile>();
            return userData.LearnedSentences; // Assuming this field exists
        }
        return new List<string>();
    }

    private async Task<List<Word>> FetchAllWordsAsync()
    {
        var snapshot = await _db.Collection("words").GetSnapshotAsync();
        return snapshot.Documents.Select(doc => doc.ConvertTo<Word>()).ToList();
    }

    private List<Word> GetLearnedWordsDetails(List<string> learnedSentences, List<Word> allWords)
    {
        var skippedWords = new HashSet<string>(getSkippedWords().Select(word => word.ToLower()));
        var learnedWords = new HashSet<string>(
            learnedSentences.SelectMany(sentence => sentence.Split(' '))
                .Select(word => word.ToLower())
                .Where(word => !skippedWords.Contains(word))
        );

        var learnedWordsDetails = learnedWords.Select(word =>
        {
            var wordDetail = FindWordDetailsIgnoringPrefix(word, allWords);
            if (wordDetail == null && word.StartsWith("ne"))
            {
                var wordWithoutPrefix = word.Substring(2);
                wordDetail = FindWordDetailsIgnoringPrefix(wordWithoutPrefix, allWords);
            }
            return wordDetail;
        }).Where(wordDetail => wordDetail != null).ToList();

        return learnedWordsDetails;
    }

    private Word FindWordDetailsIgnoringPrefix(string word, List<Word> allWords)
    {
        return allWords.FirstOrDefault(wordDetail =>
            wordDetail.WordForms.Any(form => form.Lithuanian.ToLower() == word));
    }

    private async Task<List<QuizQuestion>> GenerateQuizQuestionsAsync(List<Word> learnedWordsDetails, List<string> learnedSentences)
    {
        var allSentences = await FetchAllSentencesAsync();
        var selectedSentences = new List<string>();

        foreach (var wordDetail in learnedWordsDetails)
        {
            var relatedSentences = GetRelatedSentences(allSentences, wordDetail);
            selectedSentences.AddRange(relatedSentences.Take(2)); // Adjust the number of sentences as needed
        }

        var finalSentences = selectedSentences.Distinct().Take(10).ToList();
        var generatedQuestions = new List<QuizQuestion>();

        foreach (var sentence in finalSentences)
        {
            var question = await GenerateQuestionAsync(sentence, learnedWordsDetails);
            generatedQuestions.Add(question);
        }

        return generatedQuestions;
    }

    private async Task<QuizQuestion> GenerateQuestionAsync(string sentence, List<Word> allWords)
    {
        // Implement the logic to generate a quiz question based on the sentence and words
        // This will include determining the correct answer, options, and question type
        // For simplicity, returning a placeholder question
        return new QuizQuestion
        {
            QuestionText = "What does this sentence mean?",
            SentenceText = sentence,
            CorrectAnswerText = "Correct Answer",
            Translation = "Translation",
            Image = "",
            Options = new List<string> { "Option 1", "Option 2", "Option 3" },
            QuestionType = "multipleChoice",
            QuestionWord = "Word"
        };
    }

    private async Task<List<string>> FetchAllSentencesAsync()
    {
        var snapshot = await _db.Collection("sentences").GetSnapshotAsync();
        return snapshot.Documents.Select(doc => doc.ConvertTo<Sentence>().Text).ToList();
    }

    private List<string> GetRelatedSentences(List<string> allSentences, Word wordDetail)
    {
        // Implement logic to find related sentences based on the word detail
        return allSentences.Where(sentence => sentence.Contains(wordDetail.EnglishTranslation)).ToList();
    }

    private List<string> getSkippedWords()
    {
        return new List<string>
        {
            "yra", "Aš", "aš", "buvo", "Mano", "ir", "tu", "jis", "ji", "mes", "jie", "jos", "tai", "į"
        };
    }
}