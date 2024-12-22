using Google.Cloud.Firestore;

public class SentenceService : ISentenceService
{
    private readonly FirestoreDb _db;
    private readonly IUserService _userService;
    private readonly Random _random;

    public SentenceService(FirestoreDb db, IUserService userService)
    {
        _db = db;
        _userService = userService;
        _random = new Random();
    }

    private async Task<List<Sentence>> GetSentencesByIdsAsync(List<string> sentenceIds, int limit = 50)
    {
        if (sentenceIds == null || !sentenceIds.Any())
            return new List<Sentence>();

        var tasks = sentenceIds.Take(limit)
            .Select(id => _db.Collection("sentences").Document(id).GetSnapshotAsync());
        var snapshots = await Task.WhenAll(tasks);

        return snapshots
            .Where(snap => snap.Exists)
            .Select(snap => snap.ConvertTo<Sentence>())
            .ToList();
    }

    public async Task<List<Sentence>> GetLearnedSentencesAsync(string userId)
    {
        var user = await _userService.GetUserProfileAsync(userId);
        return await GetSentencesByIdsAsync(user.LearnedSentences);
    }

    public async Task<List<Sentence>> GetLastNLearnedSentencesAsync(string userId, int count)
    {
        var user = await _userService.GetUserProfileAsync(userId);
        var lastNIds = user.LearnedSentences?.TakeLast(count).ToList() ?? new List<string>();
        return await GetSentencesByIdsAsync(lastNIds);
    }

    public async Task<Sentence> GetRandomLearnedSentenceAsync(string userId)
    {
        var user = await _userService.GetUserProfileAsync(userId);
        var learnedSentenceIds = user.LearnedSentences;
        if (learnedSentenceIds == null || !learnedSentenceIds.Any())
            throw new Exception("User has no learned sentences");

        var randomId = learnedSentenceIds[_random.Next(learnedSentenceIds.Count)];
        var sentences = await GetSentencesByIdsAsync(new List<string> { randomId });
        return sentences.FirstOrDefault() ?? throw new Exception("Sentence not found");
    }
}