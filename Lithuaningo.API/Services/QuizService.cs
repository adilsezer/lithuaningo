// Services/QuizService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Google.Cloud.Firestore;

public class QuizService
{
    private readonly FirestoreDb _db;
    private readonly UserService _userService;
    private readonly SentenceService _sentenceService;
    private readonly Random _random = new Random();

    public QuizService(FirestoreDb db, UserService userService, SentenceService sentenceService)
    {
        _db = db;
        _userService = userService;
        _sentenceService = sentenceService;
    }

    public async Task<QuizData> GenerateQuizAsync(string userId)
    {
        var allSentences = await _sentenceService.GetSentencesAsync();
        var userProfile = await _userService.GetUserProfileAsync(userId);
        var lastTwoLearnedSentences = userProfile?.LearnedSentences?.TakeLast(2).ToList() ?? new List<string>();

        // Filter sentences based on learned words
        var relevantSentences = allSentences
            .Where(s => lastTwoLearnedSentences.Any(ls => ls == s.Id))
            .ToList();

        if (relevantSentences.Count < 10)
        {
            while (relevantSentences.Count < 10)
            {
                relevantSentences.Add(allSentences[_random.Next(allSentences.Count)]);
            }
        }

        // Shuffle sentences to randomize selection
        relevantSentences = relevantSentences.OrderBy(s => _random.Next()).ToList();

        var quizQuestions = new List<QuizQuestion>();

        // Define the number of each question type
        var questionTypeCounts = new Dictionary<QuestionType, int>
        {
            { QuestionType.MultipleChoice, 6 },
            { QuestionType.TrueFalse, 2 },
            { QuestionType.FillInTheBlank, 2 }
        };

        int currentIndex = 0;

        foreach (var qt in questionTypeCounts)
        {
            for (int i = 0; i < qt.Value; i++)
            {
                var sentence = relevantSentences[currentIndex++];
                switch (qt.Key)
                {
                    case QuestionType.MultipleChoice:
                        quizQuestions.Add(GenerateMultipleChoiceQuestion(sentence, allSentences));
                        break;
                    case QuestionType.TrueFalse:
                        quizQuestions.Add(GenerateTrueFalseQuestion(sentence, allSentences));
                        break;
                    case QuestionType.FillInTheBlank:
                        quizQuestions.Add(GenerateFillInTheBlankQuestion(sentence));
                        break;
                }
            }
        }

        return new QuizData { Questions = quizQuestions };
    }

    private QuizQuestion GenerateMultipleChoiceQuestion(Sentence sentence, List<Sentence> allSentences)
    {
        var correctAnswer = sentence.EnglishTranslation;
        var options = GenerateOptions(correctAnswer, allSentences, exclude: correctAnswer);
        return new QuizQuestion
        {
            QuestionType = QuestionType.MultipleChoice,
            QuestionText = $"What does the word {correctAnswer} mean in the following sentence?",
            SentenceText = sentence.Text,
            CorrectAnswer = correctAnswer,
            Options = options
        };
    }

    private QuizQuestion GenerateTrueFalseQuestion(Sentence sentence, List<Sentence> allSentences)
    {
        bool isCorrect = _random.NextDouble() < 0.5;
        string statement;

        if (isCorrect)
        {
            statement = sentence.EnglishTranslation;
        }
        else
        {
            // Get all sentences except the current one
            var incorrectSentences = allSentences
                .Where(s => s.EnglishTranslation != sentence.EnglishTranslation)
                .ToList();

            if (!incorrectSentences.Any())
            {
                // Fallback if no other sentences available
                isCorrect = true;
                statement = sentence.EnglishTranslation;
            }
            else
            {
                // Pick a random incorrect translation
                var incorrectSentence = incorrectSentences[_random.Next(incorrectSentences.Count)];
                statement = incorrectSentence.EnglishTranslation;
            }
        }

        return new QuizQuestion
        {
            QuestionType = QuestionType.TrueFalse,
            QuestionText = $"Does the following sentence mean \"{statement}\"?",
            SentenceText = sentence.Text,
            CorrectAnswer = isCorrect ? "True" : "False",
            Options = new List<string> { "True", "False" }
        };
    }

    private QuizQuestion GenerateFillInTheBlankQuestion(Sentence sentence)
    {
        var words = sentence.Text.Split(' ').ToList();
        if (words.Count == 0)
        {
            throw new Exception("Sentence has no words to replace.");
        }

        int wordIndex = _random.Next(words.Count);
        string missingWord = words[wordIndex];
        words[wordIndex] = "_____";
        string sentenceWithBlank = string.Join(" ", words);

        return new QuizQuestion
        {
            QuestionType = QuestionType.FillInTheBlank,
            QuestionText = "Fill in the blank in the following sentence:",
            SentenceText = sentenceWithBlank,
            CorrectAnswer = missingWord,
            Options = new List<string>()
        };
    }

    private List<string> GenerateOptions(string correctAnswer, List<Sentence> allSentences, string exclude)
    {
        var similarOptions = allSentences
            .Where(s => s.EnglishTranslation != exclude)
            .OrderBy(s => LevenshteinDistance(s.EnglishTranslation.ToLower(), correctAnswer.ToLower()))
            .Take(2)
            .Select(s => s.EnglishTranslation)
            .ToList();

        var randomOption = allSentences
            .Where(s => s.EnglishTranslation != exclude && !similarOptions.Contains(s.EnglishTranslation))
            .OrderBy(s => _random.Next())
            .FirstOrDefault()?.EnglishTranslation;

        var options = new List<string>(similarOptions);

        if (!string.IsNullOrEmpty(randomOption))
        {
            options.Add(randomOption);
        }

        // Ensure there are at least 3 options
        while (options.Count < 3)
        {
            var filler = allSentences[_random.Next(allSentences.Count)].EnglishTranslation;
            if (filler != exclude && !options.Contains(filler))
            {
                options.Add(filler);
            }
        }

        // Shuffle options
        return options.OrderBy(o => _random.Next()).ToList();
    }

    private int LevenshteinDistance(string a, string b)
    {
        if (string.IsNullOrEmpty(a))
            return string.IsNullOrEmpty(b) ? 0 : b.Length;

        if (string.IsNullOrEmpty(b))
            return a.Length;

        int[,] distance = new int[a.Length + 1, b.Length + 1];

        for (int i = 0; i <= a.Length; distance[i, 0] = i++) { }
        for (int j = 0; j <= b.Length; distance[0, j] = j++) { }

        for (int i = 1; i <= a.Length; i++)
        {
            for (int j = 1; j <= b.Length; j++)
            {
                int cost = (b[j - 1] == a[i - 1]) ? 0 : 1;

                distance[i, j] = Math.Min(
                    Math.Min(distance[i - 1, j] + 1, distance[i, j - 1] + 1),
                    distance[i - 1, j - 1] + cost);
            }
        }

        return distance[a.Length, b.Length];
    }
}
