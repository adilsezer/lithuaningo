using FluentValidation;
using Lithuaningo.API.DTOs.Announcement;
using System;

namespace Lithuaningo.API.Validators;

public class CreateAnnouncementValidator : AbstractValidator<CreateAnnouncementRequest>
{
    public CreateAnnouncementValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters")
            .MinimumLength(1).WithMessage("Title must not be empty");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Content is required")
            .MaximumLength(2000).WithMessage("Content must not exceed 2000 characters")
            .MinimumLength(1).WithMessage("Content must not be empty");

        RuleFor(x => x.ValidUntil)
            .Must(date => !date.HasValue || date.Value > DateTime.UtcNow)
            .WithMessage("Valid until date must be in the future");
    }
}

public class UpdateAnnouncementValidator : AbstractValidator<UpdateAnnouncementRequest>
{
    public UpdateAnnouncementValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters")
            .MinimumLength(1).WithMessage("Title must not be empty");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Content is required")
            .MaximumLength(2000).WithMessage("Content must not exceed 2000 characters")
            .MinimumLength(1).WithMessage("Content must not be empty");

        RuleFor(x => x.ValidUntil)
            .Must(date => !date.HasValue || date.Value > DateTime.UtcNow)
            .WithMessage("Valid until date must be in the future");
    }
} 