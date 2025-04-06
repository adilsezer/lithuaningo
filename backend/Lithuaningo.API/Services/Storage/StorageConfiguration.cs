using Amazon.Runtime;
using Amazon.S3;
using Lithuaningo.API.Settings;

namespace Lithuaningo.API.Services.Storage;

public class StorageConfiguration : IStorageConfiguration
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<StorageConfiguration> _logger;

    public StorageConfiguration(
        IConfiguration configuration,
        IWebHostEnvironment environment,
        ILogger<StorageConfiguration> logger)
    {
        _configuration = configuration;
        _environment = environment;
        _logger = logger;
    }

    public StorageSettings LoadConfiguration()
    {
        var settings = _configuration.GetSection("Storage").Get<StorageSettings>();

        if (settings == null)
        {
            throw new InvalidOperationException(
                "Storage settings not found in configuration. " +
                "Please ensure the Storage section is properly configured in appsettings.json " +
                "or use User Secrets for local development.");
        }

        settings.Validate();

        _logger.LogInformation("Storage configuration loaded successfully from {Environment} environment",
            _environment.EnvironmentName);

        return settings;
    }

    public string GetPublicBucketUrl(StorageSettings settings)
    {
        settings.Validate();
        return $"https://{settings.CustomDomain}";
    }

    public IAmazonS3 CreateS3Client(StorageSettings settings)
    {
        settings.Validate();
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
}
