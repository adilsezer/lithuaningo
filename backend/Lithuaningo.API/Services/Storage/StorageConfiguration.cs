using Amazon.Runtime;
using Amazon.S3;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using System.Text.Json;

namespace Lithuaningo.API.Services.Storage;

public class StorageConfiguration : IStorageConfiguration
{
    public StorageSettings LoadConfiguration(string credentialsPath)
    {
        if (!File.Exists(credentialsPath))
        {
            throw new FileNotFoundException($"R2 credentials file not found at: {credentialsPath}");
        }

        var credentialsJson = File.ReadAllText(credentialsPath);
        var wrapper = JsonSerializer.Deserialize<StorageSettingsWrapper>(credentialsJson)
            ?? throw new InvalidOperationException("Invalid R2 credentials format");

        ValidateSettings(wrapper.StorageSettings);
        return wrapper.StorageSettings;
    }

    public string GetPublicBucketUrl(StorageSettings settings)
    {
        ValidateSettings(settings);
        return !string.IsNullOrEmpty(settings.CustomDomain)
            ? $"https://{settings.CustomDomain}"
            : $"https://{settings.R2AccountId}.r2.cloudflarestorage.com/{settings.BucketName}";
    }

    public IAmazonS3 CreateS3Client(StorageSettings settings)
    {
        ValidateSettings(settings);
        var s3Config = new AmazonS3Config
        {
            ServiceURL = $"https://{settings.R2AccountId}.r2.cloudflarestorage.com",
            ForcePathStyle = true,
            SignatureVersion = "4",
            RequestChecksumCalculation = RequestChecksumCalculation.WHEN_REQUIRED,
            ResponseChecksumValidation = ResponseChecksumValidation.WHEN_REQUIRED
        };

        return new AmazonS3Client(
            new BasicAWSCredentials(settings.R2AccessKeyId, settings.R2AccessKeySecret),
            s3Config
        );
    }

    private static void ValidateSettings(StorageSettings settings)
    {
        if (string.IsNullOrEmpty(settings.R2AccountId))
            throw new InvalidOperationException("R2AccountId is required");
        if (string.IsNullOrEmpty(settings.R2AccessKeyId))
            throw new InvalidOperationException("R2AccessKeyId is required");
        if (string.IsNullOrEmpty(settings.R2AccessKeySecret))
            throw new InvalidOperationException("R2AccessKeySecret is required");
        if (string.IsNullOrEmpty(settings.BucketName))
            throw new InvalidOperationException("BucketName is required");
    }
} 