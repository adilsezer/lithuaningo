using FluentValidation;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.DTOs.UserFlashcardStats;
using System;

namespace Lithuaningo.API.Validators;

public class CreateFlashcardValidator : AbstractValidator<CreateFlashcardRequest>
{
    public CreateFlashcardValidator()
    {
        RuleFor(x => x.DeckId)
            .NotEmpty().WithMessage("Deck ID is required");

        RuleFor(x => x.FrontWord)
            .NotEmpty().WithMessage("Front word is required")
            .MinimumLength(1).WithMessage("Front word must not be empty")
            .MaximumLength(500).WithMessage("Front word must not exceed 500 characters");

        RuleFor(x => x.BackWord)
            .NotEmpty().WithMessage("Back word is required")
            .MinimumLength(1).WithMessage("Back word must not be empty")
            .MaximumLength(500).WithMessage("Back word must not exceed 500 characters");

        RuleFor(x => x.ExampleSentence)
            .NotEmpty().WithMessage("Example sentence is required")
            .MinimumLength(1).WithMessage("Example sentence must not be empty")
            .MaximumLength(500).WithMessage("Example sentence must not exceed 500 characters");

        RuleFor(x => x.ExampleSentenceTranslation)
            .NotEmpty().WithMessage("Example sentence translation is required")
            .MinimumLength(1).WithMessage("Example sentence translation must not be empty")
            .MaximumLength(500).WithMessage("Example sentence translation must not exceed 500 characters");

        RuleFor(x => x.ImageUrl)
            .MaximumLength(2048).WithMessage("Image URL must not exceed 2048 characters");

        RuleFor(x => x.AudioUrl)
            .MaximumLength(2048).WithMessage("Audio URL must not exceed 2048 characters");
    }
}

public class UpdateFlashcardValidator : AbstractValidator<UpdateFlashcardRequest>
{
    public UpdateFlashcardValidator()
    {
        RuleFor(x => x.FrontWord)
            .NotEmpty().WithMessage("Front word is required")
            .MinimumLength(1).WithMessage("Front word must not be empty")
            .MaximumLength(500).WithMessage("Front word must not exceed 500 characters");

        RuleFor(x => x.BackWord)
            .NotEmpty().WithMessage("Back word is required")
            .MinimumLength(1).WithMessage("Back word must not be empty")
            .MaximumLength(500).WithMessage("Back word must not exceed 500 characters");

        RuleFor(x => x.ExampleSentence)
            .NotEmpty().WithMessage("Example sentence is required")
            .MinimumLength(1).WithMessage("Example sentence must not be empty")
            .MaximumLength(500).WithMessage("Example sentence must not exceed 500 characters");

        RuleFor(x => x.ExampleSentenceTranslation)
            .NotEmpty().WithMessage("Example sentence translation is required")
            .MinimumLength(1).WithMessage("Example sentence translation must not be empty")
            .MaximumLength(500).WithMessage("Example sentence translation must not exceed 500 characters");

        RuleFor(x => x.ImageUrl)
            .MaximumLength(2048).WithMessage("Image URL must not exceed 2048 characters");

        RuleFor(x => x.AudioUrl)
            .MaximumLength(2048).WithMessage("Audio URL must not exceed 2048 characters");
    }
}

public class TrackProgressValidator : AbstractValidator<TrackProgressRequest>
{
    public TrackProgressValidator()
    {
        RuleFor(x => x.FlashcardId)
            .NotEmpty().WithMessage("Flashcard ID is required")
            .Must(BeValidGuid).WithMessage("Invalid Flashcard ID format");

        RuleFor(x => x.IsCorrect)
            .NotNull().WithMessage("IsCorrect flag is required");
    }

    private bool BeValidGuid(string guid)
    {
        return Guid.TryParse(guid, out _);
    }
} 