using System.Collections.Generic;
using System.Threading.Tasks;

public interface ISentenceService
{
    Task<List<Sentence>> GetSentencesByIdsAsync(List<string> sentenceIds, int limit = 50);
    Task<Sentence> GetRandomSentenceAsync();
}
