using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Lithuaningo.API.Validators;

[AttributeUsage(AttributeTargets.Property)]
public class MaxFileSizeAttribute : ValidationAttribute
{
    private readonly int _maxFileSize;
    public MaxFileSizeAttribute(int maxFileSize)
    {
        _maxFileSize = maxFileSize;
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is IFormFile file)
        {
            if (file.Length > _maxFileSize)
            {
                return new ValidationResult($"File size cannot exceed {_maxFileSize / (1024 * 1024)}MB");
            }
        }
        return ValidationResult.Success;
    }
}

[AttributeUsage(AttributeTargets.Property)]
public class AllowedExtensionsAttribute : ValidationAttribute
{
    private readonly string[] _extensions;
    public AllowedExtensionsAttribute(string[] extensions)
    {
        _extensions = extensions;
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is IFormFile file)
        {
            var extension = Path.GetExtension(file.FileName);
            if (!_extensions.Contains(extension.ToLower()))
            {
                return new ValidationResult($"File extension {extension} is not allowed. Allowed extensions: {string.Join(", ", _extensions)}");
            }
        }
        return ValidationResult.Success;
    }
}

[AttributeUsage(AttributeTargets.Property)]
public class ValidGuidAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is string guidString)
        {
            if (!Guid.TryParse(guidString, out _))
            {
                return new ValidationResult("Invalid GUID format");
            }
        }
        return ValidationResult.Success;
    }
} 