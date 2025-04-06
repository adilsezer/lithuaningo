using System;
using FluentValidation;
using Lithuaningo.API.DTOs.Flashcard;

namespace Lithuaningo.API.Validators;

public class CreateFlashcardValidator : AbstractValidator<FlashcardRequest>
{
    public CreateFlashcardValidator()
    {
        // Required property
        RuleFor(x => x.PrimaryCategory)
            .IsInEnum().WithMessage("Primary category must be a valid value");

        // Validate count
        RuleFor(x => x.Count)
            .InclusiveBetween(1, 10).WithMessage("Count must be between 1 and 10");

        // Validate difficulty
        RuleFor(x => x.Difficulty)
            .IsInEnum().WithMessage("Difficulty must be a valid value (Basic, Intermediate, or Advanced)");
    }
}