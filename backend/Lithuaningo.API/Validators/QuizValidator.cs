using FluentValidation;
using Lithuaningo.API.DTOs.Quiz;

namespace Lithuaningo.API.Validators;

public class CreateQuizQuestionValidator : AbstractValidator<CreateQuizQuestionRequest>
{
    public CreateQuizQuestionValidator()
    {
        RuleFor(x => x.Question)
            .NotEmpty().WithMessage("Question is required")
            .MaximumLength(500).WithMessage("Question must not exceed 500 characters")
            .MinimumLength(10).WithMessage("Question must be at least 10 characters");

        RuleFor(x => x.Options)
            .NotNull().WithMessage("Options cannot be null")
            .Must(options => options.Count >= 2 && options.Count <= 5)
            .WithMessage("Number of options must be between 2 and 5")
            .ForEach(option => 
            {
                option.NotEmpty().WithMessage("Option cannot be empty")
                    .MaximumLength(200).WithMessage("Option must not exceed 200 characters");
            });

        RuleFor(x => x.CorrectAnswer)
            .NotEmpty().WithMessage("Correct answer is required")
            .MaximumLength(200).WithMessage("Correct answer must not exceed 200 characters")
            .Must((question, correctAnswer) => question.Options.Contains(correctAnswer))
            .WithMessage("Correct answer must be one of the provided options");

        RuleFor(x => x.Explanation)
            .MaximumLength(1000).WithMessage("Explanation must not exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.Explanation));

        RuleFor(x => x.Category)
            .MaximumLength(50).WithMessage("Category must not exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.Category));

        RuleFor(x => x.DifficultyLevel)
            .InclusiveBetween(1, 5).WithMessage("Difficulty level must be between 1 and 5");
    }
} 