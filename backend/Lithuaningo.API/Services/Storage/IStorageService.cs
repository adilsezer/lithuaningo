namespace Lithuaningo.API.Services.Storage;

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
    /// <param name="fileId">File ID to use for naming (e.g., flashcard ID)</param>
    /// <returns>The URL of the uploaded file</returns>
    Task<string> UploadBinaryDataAsync(byte[] data, string contentType, string folder, string subfolder, string fileExtension, string fileId);

    /// <summary>
    /// Deletes a file from storage
    /// </summary>
    /// <param name="fileUrl">The URL of the file to delete</param>
    Task DeleteFileAsync(string fileUrl);
}