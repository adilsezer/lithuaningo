using FluentValidation;
using Lithuaningo.API.DTOs.Challenge;

namespace Lithuaningo.API.Validators;

public class ChallengeValidator : AbstractValidator<CreateChallengeRequest>
{
    public ChallengeValidator()
    {
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MinimumLength(10).WithMessage("Description must be at least 10 characters")
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

        RuleFor(x => x.Count)
            .InclusiveBetween(1, 10).WithMessage("Count must be between 1 and 10"); 
    }
} 