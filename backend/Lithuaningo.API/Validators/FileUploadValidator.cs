using FluentValidation;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Validators;

public class FileUploadValidator : AbstractValidator<FileUploadModel>
{
    private readonly string[] _allowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
    private readonly string[] _allowedAudioExtensions = { ".mp3", ".wav", ".m4a" };
    private readonly int _maxFileSize = 10 * 1024 * 1024; // 10MB

    public FileUploadValidator()
    {
        RuleFor(x => x.File)
            .NotNull().WithMessage("File is required")
            .Must(BeValidSize).WithMessage($"File size must not exceed {_maxFileSize / (1024 * 1024)}MB")
            .Must(HaveValidExtension).WithMessage($"File must be one of the following formats: {string.Join(", ", _allowedImageExtensions.Concat(_allowedAudioExtensions))}");
    }

    private bool BeValidSize(IFormFile? file)
    {
        if (file == null) return false;
        return file.Length <= _maxFileSize;
    }

    private bool HaveValidExtension(IFormFile? file)
    {
        if (file == null) return false;
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        return _allowedImageExtensions.Contains(extension) || _allowedAudioExtensions.Contains(extension);
    }
} 