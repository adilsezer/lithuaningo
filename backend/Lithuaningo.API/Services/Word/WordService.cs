using Google.Cloud.Firestore;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Utilities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services;

public class WordService : IWordService
{
    private readonly FirestoreDb _db;
    private readonly IRandomGenerator _randomGenerator;

    public WordService(FirestoreDb db, IRandomGenerator randomGenerator)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _randomGenerator = randomGenerator ?? throw new ArgumentNullException(nameof(randomGenerator));
    }

    public async Task<WordForm?> GetWordForm(string word)
    {
        var snapshot = await _db.Collection("wordForms")
                              .WhereIn("word", new[] {
                                  word.ToLower(),
                                  word.ToUpper(),
                                  char.ToUpper(word[0]) + word.Substring(1).ToLower()
                              })
                              .Limit(1)
                              .GetSnapshotAsync();
        return snapshot.Documents.FirstOrDefault()?.ConvertTo<WordForm>();
    }

    public async Task<Lemma?> GetLemma(string lemma)
    {
        foreach (var variant in new[] {
            lemma.ToLower(),
            lemma.ToUpper(),
            char.ToUpper(lemma[0]) + lemma.Substring(1).ToLower()
        })
        {
            var snapshot = await _db.Collection("lemmas").Document(variant).GetSnapshotAsync();
            if (snapshot.Exists)
            {
                return snapshot.ConvertTo<Lemma>();
            }
        }
        return null;
    }

    public async Task<List<DashboardWord>> GetRandomWordsOfTheDay(int count)
    {
        var words = new List<DashboardWord>();
        var usedLemmaIds = new HashSet<string>();

        var sentenceSnapshot = await _db.Collection("sentences")
            .OrderBy("__name__")
            .StartAt(_randomGenerator.Next(0, 1000000).ToString())
            .Limit(count * 2)
            .GetSnapshotAsync();

        var sentences = sentenceSnapshot.Documents
            .Select(d => d.ConvertTo<Sentence>())
            .OrderBy(_ => _randomGenerator.Next(100))
            .ToList();

        foreach (var sentence in sentences)
        {
            if (words.Count >= count) break;

            var validWords = TextUtilities.GetSanitizedWords(sentence.Text)
                .Where(w => !TextUtilities.IsExcludedWord(w));

            foreach (var word in validWords.OrderBy(_ => _randomGenerator.Next(100)))
            {
                var wordForm = await GetWordForm(word);
                if (wordForm == null || usedLemmaIds.Contains(wordForm.LemmaId)) continue;

                var lemma = await GetLemma(wordForm.LemmaId);
                if (lemma == null) continue;

                usedLemmaIds.Add(wordForm.LemmaId);
                words.Add(new DashboardWord
                {
                    Lemma = wordForm.LemmaId,
                    PartOfSpeech = lemma.PartOfSpeech,
                    Ipa = lemma.Ipa,
                    EnglishTranslation = lemma.Translation,
                    SentenceUsage = sentence.Text
                });

                break;
            }
        }

        return words;
    }
}