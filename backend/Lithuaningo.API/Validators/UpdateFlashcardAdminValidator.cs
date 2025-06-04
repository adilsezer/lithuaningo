using System;
using FluentValidation;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Validators
{
    public class UpdateFlashcardAdminValidator : AbstractValidator<UpdateFlashcardAdminRequest>
    {
        public UpdateFlashcardAdminValidator()
        {
            RuleFor(x => x.FrontText)
                .NotEmpty().WithMessage("Front text is required")
                .MaximumLength(500).WithMessage("Front text cannot exceed 500 characters");

            RuleFor(x => x.BackText)
                .NotEmpty().WithMessage("Back text is required")
                .MaximumLength(500).WithMessage("Back text cannot exceed 500 characters");

            RuleFor(x => x.ExampleSentence)
                .MaximumLength(1000).WithMessage("Example sentence cannot exceed 1000 characters");

            RuleFor(x => x.ExampleSentenceTranslation)
                .MaximumLength(1000).WithMessage("Example sentence translation cannot exceed 1000 characters");

            RuleFor(x => x.ImageUrl)
                .Must(BeValidUrlOrEmpty).WithMessage("Invalid Image URL format");

            RuleFor(x => x.AudioUrl)
                .Must(BeValidUrlOrEmpty).WithMessage("Invalid Audio URL format");

            RuleFor(x => x.Notes)
                .MaximumLength(2000).WithMessage("Notes cannot exceed 2000 characters");

            RuleFor(x => x.Categories)
                .NotNull().WithMessage("Categories are required")
                .NotEmpty().WithMessage("At least one category is required");

            RuleFor(x => x.Difficulty)
                .IsInEnum().WithMessage("Invalid difficulty level");

            RuleFor(x => x.IsVerified)
                .NotNull().WithMessage("Verification status is required");
        }

        private bool BeValidUrlOrEmpty(string url)
        {
            if (string.IsNullOrEmpty(url))
            {
                return true;
            }
            return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
                   && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
        }
    }
}