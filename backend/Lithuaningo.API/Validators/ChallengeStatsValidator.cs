using FluentValidation;
using Lithuaningo.API.DTOs.ChallengeStats;
using System;

namespace Lithuaningo.API.Validators;

public class CreateChallengeStatsValidator : AbstractValidator<CreateChallengeStatsRequest>
{
    public CreateChallengeStatsValidator()
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

public class UpdateChallengeStatsValidator : AbstractValidator<UpdateChallengeStatsRequest>
{
    public UpdateChallengeStatsValidator()
    {
        RuleFor(x => x.CurrentStreak)
            .GreaterThanOrEqualTo(0).WithMessage("Current streak must be non-negative");

        RuleFor(x => x.LongestStreak)
            .GreaterThanOrEqualTo(0).WithMessage("Longest streak must be non-negative")
            .GreaterThanOrEqualTo(x => x.CurrentStreak)
            .WithMessage("Longest streak must be greater than or equal to current streak");
    }
}

public class AddExperienceValidator : AbstractValidator<AddExperienceRequest>
{
    public AddExperienceValidator()
    {
        RuleFor(x => x.Amount)
            .InclusiveBetween(1, 1000)
            .WithMessage("Experience amount must be between 1 and 1000");
    }
}

public class AddLearnedWordValidator : AbstractValidator<AddLearnedWordRequest>
{
    public AddLearnedWordValidator()
    {
        RuleFor(x => x.WordId)
            .NotEmpty().WithMessage("Word ID is required")
            .Must(BeValidGuid).WithMessage("Invalid Word ID format");
    }

    private bool BeValidGuid(string guid)
    {
        return Guid.TryParse(guid, out _);
    }
} 