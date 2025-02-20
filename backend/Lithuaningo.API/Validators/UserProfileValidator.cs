using FluentValidation;
using Lithuaningo.API.DTOs.UserProfile;
using System;

namespace Lithuaningo.API.Validators;

public class UpdateUserProfileValidator : AbstractValidator<UpdateUserProfileRequest>
{
    public UpdateUserProfileValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(256).WithMessage("Email must not exceed 256 characters");

        RuleFor(x => x.EmailVerified)
            .NotNull().WithMessage("Email verified status is required");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required")
            .MinimumLength(2).WithMessage("Full name must be at least 2 characters")
            .MaximumLength(100).WithMessage("Full name must not exceed 100 characters");

        RuleFor(x => x.AvatarUrl)
            .Must(BeValidUrl).When(x => !string.IsNullOrEmpty(x.AvatarUrl))
            .WithMessage("Invalid avatar URL format");

        RuleFor(x => x.IsAdmin)
            .NotNull().WithMessage("Admin status is required");

        RuleFor(x => x.IsPremium)
            .NotNull().WithMessage("Premium status is required");

        RuleFor(x => x.PremiumExpiresAt)
            .Must(BeValidExpiryDate).When(x => x.IsPremium && x.PremiumExpiresAt.HasValue)
            .WithMessage("Premium expiry date must be in the future");
    }

    private bool BeValidUrl(string? url)
    {
        return url != null && Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }

    private bool BeValidExpiryDate(DateTime? date)
    {
        return date.HasValue && date.Value > DateTime.UtcNow;
    }
} 