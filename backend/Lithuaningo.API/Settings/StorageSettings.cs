namespace Lithuaningo.API.Settings;

public class StorageSettingsWrapper
{
    public StorageSettings StorageSettings { get; set; } = null!;
}

public class StorageSettings
{
    public string BucketName { get; set; } = string.Empty;
    public string CredentialsPath { get; set; } = string.Empty;
    public string CustomDomain { get; set; } = string.Empty;
    public StoragePaths Paths { get; set; } = new();
    
    // These will be populated from the credentials file
    public string? R2AccountId { get; set; }
    public string? R2AccessKeyId { get; set; }
    public string? R2AccessKeySecret { get; set; }
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