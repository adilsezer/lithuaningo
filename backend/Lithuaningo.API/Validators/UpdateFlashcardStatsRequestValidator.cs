using FluentValidation;
using Lithuaningo.API.DTOs.UserFlashcardStats;

namespace Lithuaningo.API.Validators
{
    public class UpdateFlashcardStatsRequestValidator : AbstractValidator<SubmitFlashcardAnswerRequest>
    {
        public UpdateFlashcardStatsRequestValidator()
        {
            RuleFor(x => x.FlashcardId)
                .NotEmpty()
                .WithMessage("FlashcardId is required");
        }
    }
}