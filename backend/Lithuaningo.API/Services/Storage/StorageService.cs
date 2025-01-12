using Lithuaningo.API.Services.Interfaces;
using Google.Cloud.Storage.V1;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;

namespace Lithuaningo.API.Services;

public class StorageService : IStorageService
{
    private readonly StorageClient _storageClient;
    private readonly StorageSettings _settings;

    public StorageService(IOptions<StorageSettings> settings)
    {
        _storageClient = StorageClient.Create();
        _settings = settings.Value;
    }

    public async Task<string> UploadFileAsync(IFormFile file, string folder, string subfolder)
    {
        try
        {
            var fileName = $"{folder}/{subfolder}/{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            using var stream = file.OpenReadStream();
            
            // Upload the file
            await _storageClient.UploadObjectAsync(
                _settings.BucketName, 
                fileName, 
                file.ContentType, 
                stream
            );

            // Get the download URL - Firebase will automatically add the token
            var encodedFileName = Uri.EscapeDataString(fileName);
            var downloadUrl = $"https://firebasestorage.googleapis.com/v0/b/{_settings.BucketName}/o/{encodedFileName}?alt=media";
            
            return downloadUrl;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error uploading file: {ex.Message}");
            throw;
        }
    }
} 