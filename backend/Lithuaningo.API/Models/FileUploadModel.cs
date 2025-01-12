using Microsoft.AspNetCore.Http;

namespace Lithuaningo.API.Models
{
    public class FileUploadModel
    {
        public IFormFile File { get; set; } = null!;
    }
} 