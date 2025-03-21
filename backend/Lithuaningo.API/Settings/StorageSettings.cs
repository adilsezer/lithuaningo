namespace Lithuaningo.API.Settings;

public class StorageSettings
{
    public string BucketName { get; set; } = string.Empty;
    public string CustomDomain { get; set; } = string.Empty;
    public string R2AccountId { get; set; } = string.Empty;
    public string R2AccessKeyId { get; set; } = string.Empty;
    public string R2AccessKeySecret { get; set; } = string.Empty;
    public StoragePaths Paths { get; set; } = new();

    public void Validate()
    {
        if (string.IsNullOrEmpty(R2AccountId))
            throw new InvalidOperationException("R2AccountId is required");
        if (string.IsNullOrEmpty(R2AccessKeyId))
            throw new InvalidOperationException("R2AccessKeyId is required");
        if (string.IsNullOrEmpty(R2AccessKeySecret))
            throw new InvalidOperationException("R2AccessKeySecret is required");
        if (string.IsNullOrEmpty(BucketName))
            throw new InvalidOperationException("BucketName is required");
        if (string.IsNullOrEmpty(CustomDomain))
            throw new InvalidOperationException("CustomDomain is required");
    }
}

public class StoragePaths
{
    public string Flashcards { get; set; } = string.Empty;
    public string Users { get; set; } = string.Empty;
    public string Images { get; set; } = string.Empty;
    public string Audio { get; set; } = string.Empty;
    public string Other { get; set; } = string.Empty;
} 