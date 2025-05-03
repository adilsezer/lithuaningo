using Amazon.S3;
using Amazon.S3.Model;
using Lithuaningo.API.Settings;

namespace Lithuaningo.API.Services.Storage;

public class StorageService : IStorageService, IDisposable
{
    private readonly IAmazonS3 _s3Client;
    private readonly StorageSettings _settings;
    private readonly string _publicBucketUrl;
    private readonly ILogger<StorageService> _logger;
    private bool _disposed;

    public StorageService(
        IStorageConfiguration storageConfiguration,
        ILogger<StorageService> logger)
    {
        _settings = storageConfiguration.LoadConfiguration();
        _logger = logger;
        logger.LogInformation("Initializing storage service with bucket: {BucketName}", _settings.BucketName);

        _publicBucketUrl = storageConfiguration.GetPublicBucketUrl(_settings);
        _s3Client = storageConfiguration.CreateS3Client(_settings);
    }

    /// <summary>
    /// Uploads binary data directly to storage
    /// </summary>
    /// <param name="data">The binary data to upload</param>
    /// <param name="contentType">The content type (MIME type) of the file</param>
    /// <param name="folder">The folder to store the file in</param>
    /// <param name="subfolder">The subfolder to store the file in</param>
    /// <param name="fileExtension">Optional file extension override (with dot, e.g. ".png")</param>
    /// <returns>The URL of the uploaded file</returns>
    public async Task<string> UploadBinaryDataAsync(byte[] data, string contentType, string folder, string subfolder, string? fileExtension = null)
    {
        if (_disposed)
        {
            ObjectDisposedException.ThrowIf(_disposed, this);
        }

        if (data == null || data.Length == 0)
        {
            throw new ArgumentException("Data cannot be null or empty", nameof(data));
        }

        try
        {
            _logger.LogInformation("Uploading binary data to storage with content type: {ContentType}", contentType);
            // Simple extension mapping for image/png and audio/mp3
            string extension = contentType.ToLowerInvariant() switch
            {
                "audio/mp3" => ".mp3",
                "audio/mpeg" => ".mp3",
                _ => ".png" // Default to png for images and anything else
            };

            // Override with explicit extension if provided
            if (!string.IsNullOrEmpty(fileExtension))
            {
                extension = fileExtension;
            }

            var fileName = $"{folder}/{subfolder}/{Guid.NewGuid()}{extension}";

            using var memoryStream = new MemoryStream(data);

            var putRequest = new PutObjectRequest
            {
                BucketName = _settings.BucketName,
                Key = fileName,
                InputStream = memoryStream,
                ContentType = contentType,
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

    public async Task DeleteFileAsync(string fileUrl)
    {
        if (_disposed)
        {
            ObjectDisposedException.ThrowIf(_disposed, this);
        }

        if (string.IsNullOrEmpty(fileUrl))
        {
            return; // Nothing to delete
        }

        try
        {
            // Extract the file key from the URL
            // The URL format is: https://customdomain.com/folder/subfolder/filename.ext
            string key = ExtractKeyFromUrl(fileUrl);

            if (string.IsNullOrEmpty(key))
            {
                return; // Invalid URL format, nothing to delete
            }

            var deleteRequest = new DeleteObjectRequest
            {
                BucketName = _settings.BucketName,
                Key = key
            };

            await _s3Client.DeleteObjectAsync(deleteRequest);
        }
        catch (AmazonS3Exception ex)
        {
            var message = ex.ErrorCode switch
            {
                "NoSuchBucket" => $"Bucket {_settings.BucketName} does not exist",
                "AccessDenied" => "Access denied to R2 bucket - check credentials",
                "NoSuchKey" => "File does not exist in the bucket",
                _ => $"Error deleting from R2: {ex.Message}"
            };
            throw new Exception(message, ex);
        }
    }

    private string ExtractKeyFromUrl(string fileUrl)
    {
        if (string.IsNullOrEmpty(fileUrl))
        {
            return string.Empty;
        }

        // Remove the domain part to get the key
        if (fileUrl.StartsWith(_publicBucketUrl))
        {
            return fileUrl.Substring(_publicBucketUrl.Length + 1); // +1 for the trailing slash
        }

        // If URL doesn't start with the expected domain, try to extract the path
        try
        {
            var uri = new Uri(fileUrl);
            return uri.AbsolutePath.TrimStart('/');
        }
        catch
        {
            return string.Empty;
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
