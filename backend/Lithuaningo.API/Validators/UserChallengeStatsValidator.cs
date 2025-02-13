using FluentValidation;
using Lithuaningo.API.DTOs.UserChallengeStats;
using System;

namespace Lithuaningo.API.Validators;

public class CreateUserChallengeStatsValidator : AbstractValidator<CreateUserChallengeStatsRequest>
{
    public CreateUserChallengeStatsValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.CurrentStreak)
            .GreaterThanOrEqualTo(0).WithMessage("Current streak must be non-negative");

        RuleFor(x => x.LongestStreak)
            .GreaterThanOrEqualTo(0).WithMessage("Longest streak must be non-negative")
            .GreaterThanOrEqualTo(x => x.CurrentStreak)
            .WithMessage("Longest streak must be greater than or equal to current streak");
    }
}

public class UpdateUserChallengeStatsValidator : AbstractValidator<UpdateUserChallengeStatsRequest>
{
    public UpdateUserChallengeStatsValidator()
    {
        RuleFor(x => x.CurrentStreak)
            .GreaterThanOrEqualTo(0).WithMessage("Current streak must be non-negative");

        RuleFor(x => x.LongestStreak)
            .GreaterThanOrEqualTo(0).WithMessage("Longest streak must be non-negative")
            .GreaterThanOrEqualTo(x => x.CurrentStreak)
            .WithMessage("Longest streak must be greater than or equal to current streak");
    }
}