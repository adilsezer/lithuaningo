namespace Lithuaningo.API.Services.Interfaces;

public interface IStorageService
{
    Task<string> UploadFileAsync(IFormFile file, string folder);
} 