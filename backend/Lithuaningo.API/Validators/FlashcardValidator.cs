using FluentValidation;
using Lithuaningo.API.DTOs.Flashcard;
using Lithuaningo.API.DTOs.FlashcardStats;

namespace Lithuaningo.API.Validators;

public class CreateFlashcardValidator : AbstractValidator<CreateFlashcardRequest>
{
    public CreateFlashcardValidator()
    {
        RuleFor(x => x.DeckId)
            .NotEmpty().WithMessage("Deck ID is required")
            .Must(BeValidGuid).WithMessage("Invalid Deck ID format");

        RuleFor(x => x.FrontText)
            .NotEmpty().WithMessage("Front content is required")
            .MinimumLength(1).WithMessage("Front content must not be empty")
            .MaximumLength(500).WithMessage("Front content must not exceed 500 characters");

        RuleFor(x => x.BackText)
            .NotEmpty().WithMessage("Back content is required")
            .MinimumLength(1).WithMessage("Back content must not be empty")
            .MaximumLength(1000).WithMessage("Back content must not exceed 1000 characters");
    }

    private bool BeValidGuid(string guid)
    {
        return Guid.TryParse(guid, out _);
    }
}

public class UpdateFlashcardValidator : AbstractValidator<UpdateFlashcardRequest>
{
    public UpdateFlashcardValidator()
    {
        RuleFor(x => x.FrontText)
            .NotEmpty().WithMessage("Front content is required")
            .MinimumLength(1).WithMessage("Front content must not be empty")
            .MaximumLength(500).WithMessage("Front content must not exceed 500 characters");

        RuleFor(x => x.BackText)
            .NotEmpty().WithMessage("Back content is required")
            .MinimumLength(1).WithMessage("Back content must not be empty")
            .MaximumLength(1000).WithMessage("Back content must not exceed 1000 characters");
    }
}

public class TrackProgressValidator : AbstractValidator<TrackProgressRequest>
{
    public TrackProgressValidator()
    {
        RuleFor(x => x.FlashcardId)
            .NotEmpty().WithMessage("Flashcard ID is required")
            .Must(BeValidGuid).WithMessage("Invalid Flashcard ID format");
    }

    private bool BeValidGuid(string guid)
    {
        return Guid.TryParse(guid, out _);
    }
} 