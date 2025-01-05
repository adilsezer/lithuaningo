using Lithuaningo.API.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Lithuaningo.API.Services.Interfaces;

public interface IWordService
{
    Task<WordForm?> GetWordForm(string word);
    Task<Lemma?> GetLemma(string lemma);
    Task<List<DashboardWord>> GetRandomWordsOfTheDay(int count);
}
