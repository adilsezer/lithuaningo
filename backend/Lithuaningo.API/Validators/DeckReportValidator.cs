using FluentValidation;
using Lithuaningo.API.DTOs.DeckReport;

namespace Lithuaningo.API.Validators;

public class CreateDeckReportValidator : AbstractValidator<CreateDeckReportRequest>
{
    public CreateDeckReportValidator()
    {
        RuleFor(x => x.DeckId)
            .NotEmpty().WithMessage("Deck ID is required");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason is required")
            .MaximumLength(200).WithMessage("Reason must not exceed 200 characters");

        RuleFor(x => x.Details)
            .NotEmpty().WithMessage("Details are required")
            .MaximumLength(1000).WithMessage("Details must not exceed 1000 characters");
    }
}

public class UpdateDeckReportValidator : AbstractValidator<UpdateDeckReportRequest>
{
    private readonly string[] _validStatuses = { "pending", "resolved", "rejected" };

    public UpdateDeckReportValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status is required")
            .Must(status => _validStatuses.Contains(status.ToLower()))
            .WithMessage($"Status must be one of: {string.Join(", ", _validStatuses)}");

        RuleFor(x => x.ReviewerId)
            .NotEmpty().WithMessage("Reviewer ID is required");

        RuleFor(x => x.Resolution)
            .NotEmpty().WithMessage("Resolution is required when updating status")
            .MaximumLength(1000).WithMessage("Resolution must not exceed 1000 characters")
            .When(x => x.Status.ToLower() != "pending");
    }
} 