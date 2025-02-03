using Amazon.S3;
using Lithuaningo.API.Settings;

namespace Lithuaningo.API.Services.Interfaces;

public interface IStorageConfiguration
{
    StorageSettings LoadConfiguration(string credentialsPath);
    string GetPublicBucketUrl(StorageSettings settings);
    IAmazonS3 CreateS3Client(StorageSettings settings);
} 