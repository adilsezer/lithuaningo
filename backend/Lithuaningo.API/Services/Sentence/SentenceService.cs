using Google.Cloud.Firestore;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;

namespace Lithuaningo.API.Services
{
    public class SentenceService : ISentenceService
    {
        private readonly FirestoreDb _db;
        private readonly string _collectionName;
        private readonly IRandomGenerator _randomGenerator;

        public SentenceService(FirestoreDb db, IOptions<FirestoreCollectionSettings> collectionSettings, IRandomGenerator randomGenerator)
        {
            _db = db ?? throw new ArgumentNullException(nameof(db));
            _collectionName = collectionSettings.Value.Sentences;
            _randomGenerator = randomGenerator ?? throw new ArgumentNullException(nameof(randomGenerator));
        }

        public async Task<List<Sentence>> GetSentencesByIdsAsync(List<string> sentenceIds, int limit = 50)
        {
            if (sentenceIds == null || !sentenceIds.Any())
                return new List<Sentence>();

            var batch = _db.Collection(_collectionName).WhereIn(FieldPath.DocumentId, sentenceIds.Take(limit));
            var querySnapshot = await batch.GetSnapshotAsync();

            return querySnapshot
                .Select(snap => snap.ConvertTo<Sentence>())
                .ToList();
        }

        public async Task<Sentence> GetRandomSentenceAsync()
        {
            var randomIndex = _randomGenerator.Next(0, 20);
            var randomDoc = await _db.Collection(_collectionName)
                .Offset(randomIndex)
                .Limit(1)
                .GetSnapshotAsync();

            return randomDoc.FirstOrDefault()?.ConvertTo<Sentence>() 
                ?? throw new InvalidOperationException("No sentences found in the database.");
        }
    }
}
