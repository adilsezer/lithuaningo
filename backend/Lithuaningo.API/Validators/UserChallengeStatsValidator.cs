using System;
using FluentValidation;
using Lithuaningo.API.DTOs.UserChallengeStats;

namespace Lithuaningo.API.Validators;


public class SubmitChallengeAnswerValidator : AbstractValidator<SubmitChallengeAnswerRequest>
{
    public SubmitChallengeAnswerValidator()
    {
        RuleFor(x => x.ChallengeId)
            .NotEmpty().WithMessage("Challenge ID is required");
    }
}