namespace Lithuaningo.API.Services.Cache;

public class CacheSettings
{
    public int DefaultExpirationMinutes { get; set; } = 10;
    public int WordCacheMinutes { get; set; } = 60; // Words change rarely
    public int DeckCacheMinutes { get; set; } = 5;  // Decks are frequently updated
    public int FlashcardCacheMinutes { get; set; } = 5;
    public int LeaderboardCacheMinutes { get; set; } = 2; // Frequent updates
    public int AnnouncementCacheMinutes { get; set; } = 30;
    public int AppInfoCacheMinutes { get; set; } = 60;
} 