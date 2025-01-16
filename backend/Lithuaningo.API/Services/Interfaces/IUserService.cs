public interface IUserService
{
    Task<UserProfile> GetUserProfileAsync(string userId);
    Task UpdateUserProfileAsync(UserProfile userProfile);
    Task AddUserLearnedSentencesAsync(string userId, List<string> sentenceIds);
    Task<List<Sentence>> GetLearnedSentencesAsync(string userId);
    Task<List<Sentence>> GetLastNLearnedSentencesAsync(string userId, int count);
    Task<Sentence> GetRandomLearnedSentenceAsync(string userId);
    Task CreateUserProfileAsync(string userId);
    Task DeleteUserProfileAsync(string userId);
}
