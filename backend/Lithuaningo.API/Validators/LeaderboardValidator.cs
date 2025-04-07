using FluentValidation;
using Lithuaningo.API.DTOs.Leaderboard;

namespace Lithuaningo.API.Validators;

public class UpdateLeaderboardEntryValidator : AbstractValidator<UpdateLeaderboardEntryRequest>
{
    public UpdateLeaderboardEntryValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.ScoreToAdd)
            .NotEmpty().WithMessage("Score is required")
            .GreaterThanOrEqualTo(0).WithMessage("Score must be non-negative")
            .LessThanOrEqualTo(int.MaxValue).WithMessage("Score must not exceed maximum value");
    }
}