using System.Collections.Generic;
using System.Threading.Tasks;

public interface ISentenceService
{
    Task<List<Sentence>> GetLearnedSentencesAsync(string userId);
    Task<List<Sentence>> GetLastNLearnedSentencesAsync(string userId, int count);
    Task<Sentence> GetRandomLearnedSentenceAsync(string userId);
}