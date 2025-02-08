using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using static Supabase.Postgrest.Constants;
using Supabase;
using Supabase.Postgrest.Responses;

namespace Lithuaningo.API.Services;

public class SupabaseWordService : IWordService
{
    private readonly Client _supabaseClient;
    private readonly ICacheService _cache;
    private readonly CacheSettings _cacheSettings;
    private const string CacheKeyPrefix = "word:";
    private readonly ILogger<SupabaseWordService> _logger;

    public SupabaseWordService(
        ISupabaseService supabaseService,
        ICacheService cache,
        IOptions<CacheSettings> cacheSettings,
        ILogger<SupabaseWordService> logger)
    {
        _supabaseClient = supabaseService.Client;
        _cache = cache;
        _cacheSettings = cacheSettings.Value;
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<IEnumerable<WordForm>> GetWordFormsAsync()
    {
        var cacheKey = $"{CacheKeyPrefix}all_forms";
        var cached = await _cache.GetAsync<IEnumerable<WordForm>>(cacheKey);
        
        if (cached != null)
        {
            _logger.LogInformation("Retrieved word forms from cache");
            return cached;
        }

        try
        {
            var response = await _supabaseClient
                .From<WordForm>()
                .Get();

            var forms = response.Models;
            
            await _cache.SetAsync(cacheKey, forms, 
                TimeSpan.FromMinutes(_cacheSettings.WordCacheMinutes));

            _logger.LogInformation("Retrieved and cached {Count} word forms", forms.Count);
            return forms;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving word forms");
            throw;
        }
    }

    public async Task<WordForm?> GetWordFormByIdAsync(Guid id)
    {
        var cacheKey = $"{CacheKeyPrefix}form:{id}";
        var cached = await _cache.GetAsync<WordForm>(cacheKey);
        
        if (cached != null)
        {
            _logger.LogInformation("Retrieved word form {Id} from cache", id);
            return cached;
        }

        try
        {
            var response = await _supabaseClient
                .From<WordForm>()
                .Where(w => w.Id == id)
                .Get();

            var form = response.Models.FirstOrDefault();
            if (form != null)
            {
                await _cache.SetAsync(cacheKey, form, 
                    TimeSpan.FromMinutes(_cacheSettings.WordCacheMinutes));
                _logger.LogInformation("Retrieved and cached word form {Id}", id);
                return form;
            }

            _logger.LogInformation("Word form {Id} not found", id);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving word form {Id}", id);
            throw;
        }
    }

    public async Task<WordForm?> GetWordForm(string word)
    {
        if (string.IsNullOrWhiteSpace(word))
        {
            throw new ArgumentException("Word cannot be empty", nameof(word));
        }

        var normalizedWord = word.ToLowerInvariant();
        var cacheKey = $"{CacheKeyPrefix}form:text:{normalizedWord}";
        var cached = await _cache.GetAsync<WordForm>(cacheKey);

        if (cached != null)
        {
            _logger.LogInformation("Retrieved word form for '{Word}' from cache", word);
            return cached;
        }

        try
        {
            var response = await _supabaseClient
                .From<WordForm>()
                .Filter(w => w.Word, Operator.Equals, normalizedWord)
                .Get();

            var wordForm = response.Models.FirstOrDefault();
            if (wordForm != null)
            {
                await _cache.SetAsync(cacheKey, wordForm,
                    TimeSpan.FromMinutes(_cacheSettings.WordCacheMinutes));
                _logger.LogInformation("Retrieved and cached word form for '{Word}'", word);
                return wordForm;
            }

            _logger.LogInformation("Word form not found for '{Word}'", word);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving word form for '{Word}'", word);
            throw;
        }
    }

    public async Task<IEnumerable<Lemma>> GetLemmasAsync()
    {
        var cacheKey = $"{CacheKeyPrefix}all_lemmas";
        var cached = await _cache.GetAsync<IEnumerable<Lemma>>(cacheKey);
        
        if (cached != null)
        {
            _logger.LogInformation("Retrieved lemmas from cache");
            return cached;
        }

        try
        {
            var response = await _supabaseClient
                .From<Lemma>()
                .Get();

            var lemmas = response.Models;
            
            await _cache.SetAsync(cacheKey, lemmas, 
                TimeSpan.FromMinutes(_cacheSettings.WordCacheMinutes));

            _logger.LogInformation("Retrieved and cached {Count} lemmas", lemmas.Count);
            return lemmas;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving lemmas");
            throw;
        }
    }

    public async Task<Lemma?> GetLemmaByIdAsync(Guid id)
    {
        var cacheKey = $"{CacheKeyPrefix}lemma:{id}";
        var cached = await _cache.GetAsync<Lemma>(cacheKey);
        
        if (cached != null)
        {
            _logger.LogInformation("Retrieved lemma {Id} from cache", id);
            return cached;
        }

        try
        {
            var response = await _supabaseClient
                .From<Lemma>()
                .Where(l => l.Id == id)
                .Get();

            var lemma = response.Models.FirstOrDefault();
            if (lemma != null)
            {
                await _cache.SetAsync(cacheKey, lemma, 
                    TimeSpan.FromMinutes(_cacheSettings.WordCacheMinutes));
                _logger.LogInformation("Retrieved and cached lemma {Id}", id);
                return lemma;
            }

            _logger.LogInformation("Lemma {Id} not found", id);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving lemma {Id}", id);
            throw;
        }
    }

    public async Task<Lemma?> GetLemma(string lemma)
    {
        if (string.IsNullOrWhiteSpace(lemma))
        {
            throw new ArgumentException("Word cannot be empty", nameof(lemma));
        }

        var normalizedWord = lemma.ToLowerInvariant();
        var cacheKey = $"{CacheKeyPrefix}lemma:text:{normalizedWord}";
        var cached = await _cache.GetAsync<Lemma>(cacheKey);

        if (cached != null)
        {
            _logger.LogInformation("Retrieved lemma for '{Word}' from cache", lemma);
            return cached;
        }

        try
        {
            var response = await _supabaseClient
                .From<Lemma>()
                .Filter(l => l.Word, Operator.Equals, normalizedWord)
                .Get();

            var result = response.Models.FirstOrDefault();
            if (result != null)
            {
                await _cache.SetAsync(cacheKey, result,
                    TimeSpan.FromMinutes(_cacheSettings.WordCacheMinutes));
                _logger.LogInformation("Retrieved and cached lemma for '{Word}'", lemma);
                return result;
            }

            _logger.LogInformation("Lemma not found for '{Word}'", lemma);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving lemma for '{Word}'", lemma);
            throw;
        }
    }
} 