using FluentValidation;
using Lithuaningo.API.DTOs.DeckVote;

namespace Lithuaningo.API.Validators;

public class CreateDeckVoteValidator : AbstractValidator<CreateDeckVoteRequest>
{
    public CreateDeckVoteValidator()
    {
        RuleFor(x => x.DeckId)
            .NotEmpty().WithMessage("Deck ID is required");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");
    }
} 