using FluentValidation;
using Lithuaningo.API.DTOs.Flashcard;
using System;

namespace Lithuaningo.API.Validators;

public class CreateFlashcardValidator : AbstractValidator<CreateFlashcardRequest>
{
    public CreateFlashcardValidator()
    {
        // Required properties
        RuleFor(x => x.Topic)
            .NotEmpty().WithMessage("Description is required")
            .MinimumLength(2).WithMessage("Description must be at least 2 characters")
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

        RuleFor(x => x.Count)
            .InclusiveBetween(1, 10).WithMessage("Count must be between 1 and 10");
    }
}