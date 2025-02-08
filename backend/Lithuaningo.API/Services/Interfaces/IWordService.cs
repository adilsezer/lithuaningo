using Lithuaningo.API.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Lithuaningo.API.Services.Interfaces;

public interface IWordService
{
    /// <summary>
    /// Retrieves a word form for the specified word.
    /// </summary>
    /// <param name="word">The word to get the form for.</param>
    /// <returns>The word form if found, null otherwise.</returns>
    Task<WordForm?> GetWordForm(string word);

    /// <summary>
    /// Retrieves a lemma for the specified word.
    /// </summary>
    /// <param name="lemma">The lemma to retrieve.</param>
    /// <returns>The lemma if found, null otherwise.</returns>
    Task<Lemma?> GetLemma(string lemma);
}
