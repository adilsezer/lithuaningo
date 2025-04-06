using FluentValidation;
using Lithuaningo.API.DTOs.UserFlashcardStats;

namespace Lithuaningo.API.Validators
{
    public class SubmitFlashcardAnswerValidator : AbstractValidator<SubmitFlashcardAnswerRequest>
    {
        public SubmitFlashcardAnswerValidator()
        {
            RuleFor(x => x.FlashcardId)
                .NotEmpty().WithMessage("Flashcard ID is required");
        }
    }
}