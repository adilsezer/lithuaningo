using FluentValidation;
using Lithuaningo.API.DTOs.UserProfile;

namespace Lithuaningo.API.Validators;

public class CreateUserProfileValidator : AbstractValidator<CreateUserProfileRequest>
{
    public CreateUserProfileValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required")
            .Must(BeValidGuid).WithMessage("Invalid User ID format");
    }

    private bool BeValidGuid(string guid)
    {
        return Guid.TryParse(guid, out _);
    }
}

public class UpdateUserProfileValidator : AbstractValidator<UpdateUserProfileRequest>
{
    public UpdateUserProfileValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(256).WithMessage("Email must not exceed 256 characters");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required")
            .MinimumLength(2).WithMessage("Full name must be at least 2 characters")
            .MaximumLength(100).WithMessage("Full name must not exceed 100 characters");

        RuleFor(x => x.AvatarUrl)
            .Must(BeValidUrl).When(x => !string.IsNullOrEmpty(x.AvatarUrl))
            .WithMessage("Invalid avatar URL format");
    }

    private bool BeValidUrl(string? url)
    {
        return url != null && Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
} 