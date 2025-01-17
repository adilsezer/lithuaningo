using Google.Cloud.Firestore;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Utilities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;

namespace Lithuaningo.API.Services;

public class WordService : IWordService
{
    private readonly FirestoreDb _db;
    private readonly string _wordsCollection;
    private readonly string _wordFormsCollection;
    private readonly string _lemmasCollection;

    public WordService(FirestoreDb db, IOptions<FirestoreCollectionSettings> collectionSettings)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _wordsCollection = collectionSettings.Value.Words;
        _wordFormsCollection = collectionSettings.Value.WordForms;
        _lemmasCollection = collectionSettings.Value.Lemmas;
    }

    public async Task<WordForm?> GetWordForm(string word)
    {
        var snapshot = await _db.Collection(_wordFormsCollection)
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
            var snapshot = await _db.Collection(_lemmasCollection).Document(variant).GetSnapshotAsync();
            if (snapshot.Exists)
            {
                return snapshot.ConvertTo<Lemma>();
            }
        }
        return null;
    }
}