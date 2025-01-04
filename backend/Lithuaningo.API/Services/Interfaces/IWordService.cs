public interface IWordService
{
    Task<WordForm?> GetWordForm(string word);
    Task<Lemma?> GetLemma(string lemma);
    Task<List<WordOfTheDay>> GetRandomWordsOfTheDay(int count);
}
