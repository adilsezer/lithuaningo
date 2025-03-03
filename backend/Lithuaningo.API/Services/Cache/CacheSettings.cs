namespace Lithuaningo.API.Services.Cache;

public class CacheSettings
{
    public int DefaultExpirationMinutes { get; set; }
    public int WordCacheMinutes { get; set; }
    public int DeckCacheMinutes { get; set; }
    public int FlashcardCacheMinutes { get; set; }
    public int LeaderboardCacheMinutes { get; set; }
    public int AnnouncementCacheMinutes { get; set; }
    public int AppInfoCacheMinutes { get; set; }
} 