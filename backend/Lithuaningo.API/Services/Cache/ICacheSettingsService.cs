namespace Lithuaningo.API.Services.Cache
{
    public interface ICacheSettingsService
    {
        Task<CacheSettings> GetCacheSettingsAsync();
    }
}