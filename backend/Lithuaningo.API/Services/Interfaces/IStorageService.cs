namespace Lithuaningo.API.Services.Interfaces;

public interface IStorageService
{
    /// <summary>
    /// Uploads binary data directly to storage
    /// </summary>
    /// <param name="data">The binary data to upload</param>
    /// <param name="contentType">The content type (MIME type) of the file</param>
    /// <param name="folder">The folder to store the file in</param>
    /// <param name="subfolder">The subfolder to store the file in</param>
    /// <param name="fileExtension">The file extension (with dot, e.g. ".png")</param>
    /// <returns>The URL of the uploaded file</returns>
    Task<string> UploadBinaryDataAsync(byte[] data, string contentType, string folder, string subfolder, string? fileExtension = null);
    
    Task DeleteFileAsync(string fileUrl);
} 