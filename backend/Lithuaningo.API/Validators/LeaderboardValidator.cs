using FluentValidation;
using Lithuaningo.API.DTOs.Leaderboard;

namespace Lithuaningo.API.Validators;

public class UpdateLeaderboardEntryValidator : AbstractValidator<UpdateLeaderboardEntryRequest>
{
    public UpdateLeaderboardEntryValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required")
            .Must(BeValidGuid).WithMessage("Invalid User ID format");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MinimumLength(2).WithMessage("Name must be at least 2 characters")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters");

        RuleFor(x => x.Score)
            .GreaterThanOrEqualTo(0).WithMessage("Score must be non-negative")
            .LessThanOrEqualTo(int.MaxValue).WithMessage("Score must not exceed maximum value");
    }

    private bool BeValidGuid(string guid)
    {
        return Guid.TryParse(guid, out _);
    }
} 