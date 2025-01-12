namespace Lithuaningo.API.Settings;

public class StorageSettings
{
    public string BucketName { get; set; } = string.Empty;
    public StoragePaths Paths { get; set; } = new();
}

public class StoragePaths
{
    public string Flashcards { get; set; } = string.Empty;
    public string Decks { get; set; } = string.Empty;
    public string Users { get; set; } = string.Empty;
    public string Images { get; set; } = string.Empty;
    public string Audio { get; set; } = string.Empty;
    public string Other { get; set; } = string.Empty;
} 