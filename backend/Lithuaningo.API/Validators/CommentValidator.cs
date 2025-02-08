using FluentValidation;
using Lithuaningo.API.DTOs.Comment;

namespace Lithuaningo.API.Validators;

public class CreateCommentValidator : AbstractValidator<CreateCommentRequest>
{
    public CreateCommentValidator()
    {
        RuleFor(x => x.DeckId)
            .NotEmpty().WithMessage("Deck ID is required")
            .Must(BeValidGuid).WithMessage("Invalid Deck ID format");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required")
            .Must(BeValidGuid).WithMessage("Invalid User ID format");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Content is required")
            .MinimumLength(1).WithMessage("Content must not be empty")
            .MaximumLength(1000).WithMessage("Content must not exceed 1000 characters");
    }

    private bool BeValidGuid(string guid)
    {
        return Guid.TryParse(guid, out _);
    }
}

public class UpdateCommentValidator : AbstractValidator<UpdateCommentRequest>
{
    public UpdateCommentValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Content is required")
            .MinimumLength(1).WithMessage("Content must not be empty")
            .MaximumLength(1000).WithMessage("Content must not exceed 1000 characters");
    }
} 