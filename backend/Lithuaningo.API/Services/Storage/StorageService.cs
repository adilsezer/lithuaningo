using Amazon.S3;
using Amazon.S3.Model;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;

namespace Lithuaningo.API.Services.Storage;

public class StorageService : IStorageService, IDisposable
{
    private readonly IAmazonS3 _s3Client;
    private readonly StorageSettings _settings;
    private readonly string _publicBucketUrl;
    private bool _disposed;

    public StorageService(
        IOptions<StorageSettings> settings,
        IStorageConfiguration storageConfiguration)
    {
        _settings = settings.Value;
        
        var credentials = storageConfiguration.LoadConfiguration(
            Path.Combine(Directory.GetCurrentDirectory(), _settings.CredentialsPath)
        );

        // Update settings from credentials
        _settings.R2AccountId = credentials.R2AccountId;
        _settings.R2AccessKeyId = credentials.R2AccessKeyId;
        _settings.R2AccessKeySecret = credentials.R2AccessKeySecret;
        _settings.CustomDomain = credentials.CustomDomain;

        _publicBucketUrl = storageConfiguration.GetPublicBucketUrl(_settings);
        _s3Client = storageConfiguration.CreateS3Client(_settings);
    }

    public async Task<string> UploadFileAsync(IFormFile file, string folder, string subfolder)
    {
        if (_disposed)
        {
            throw new ObjectDisposedException(nameof(StorageService));
        }

        try
        {
            var fileName = $"{folder}/{subfolder}/{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            memoryStream.Position = 0;

            var putRequest = new PutObjectRequest
            {
                BucketName = _settings.BucketName,
                Key = fileName,
                InputStream = memoryStream,
                ContentType = file.ContentType,
                DisablePayloadSigning = true,
            };

            await _s3Client.PutObjectAsync(putRequest);
            return $"{_publicBucketUrl}/{fileName}";
        }
        catch (AmazonS3Exception ex)
        {
            var message = ex.ErrorCode switch
            {
                "NoSuchBucket" => $"Bucket {_settings.BucketName} does not exist",
                "AccessDenied" => "Access denied to R2 bucket - check credentials",
                _ => $"Error uploading to R2: {ex.Message}"
            };
            throw new Exception(message, ex);
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed)
        {
            return;
        }

        if (disposing)
        {
            _s3Client?.Dispose();
        }

        _disposed = true;
    }
}
