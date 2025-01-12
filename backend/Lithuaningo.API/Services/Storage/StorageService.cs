using Lithuaningo.API.Services.Interfaces;
using Google.Cloud.Storage.V1;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;

namespace Lithuaningo.API.Services;

public class StorageService : IStorageService
{
    private readonly StorageClient _storageClient;
    private readonly string _bucketName;

    public StorageService(IOptions<StorageSettings> storageSettings)
    {
        _storageClient = StorageClient.Create();
        _bucketName = storageSettings.Value.BucketName;
    }

    public async Task<string> UploadFileAsync(IFormFile file, string folder)
    {
        try
        {
            var fileName = $"{folder}/{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            using var stream = file.OpenReadStream();
            
            await _storageClient.UploadObjectAsync(_bucketName, fileName, file.ContentType, stream);
            
            return $"https://storage.googleapis.com/{_bucketName}/{fileName}";
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error uploading file: {ex.Message}");
            throw;
        }
    }
} 