using FluentValidation;
using Lithuaningo.API.DTOs.Deck;
using System;

namespace Lithuaningo.API.Validators;

public class CreateDeckValidator : AbstractValidator<CreateDeckRequest>
{
    public CreateDeckValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MinimumLength(3).WithMessage("Title must be at least 3 characters")
            .MaximumLength(100).WithMessage("Title must not exceed 100 characters");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.IsPublic)
            .NotNull().WithMessage("IsPublic flag is required");

        RuleFor(x => x.Tags)
            .Must(tags => tags == null || tags.Count <= 10)
            .WithMessage("Maximum 10 tags are allowed")
            .Must(tags => tags == null || tags.All(tag => tag.Length <= 30))
            .WithMessage("Tag length must not exceed 30 characters");
    }
}

public class UpdateDeckValidator : AbstractValidator<UpdateDeckRequest>
{
    public UpdateDeckValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MinimumLength(3).WithMessage("Title must be at least 3 characters")
            .MaximumLength(100).WithMessage("Title must not exceed 100 characters");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

        RuleFor(x => x.IsPublic)
            .NotNull().WithMessage("IsPublic flag is required");

        RuleFor(x => x.Tags)
            .Must(tags => tags == null || tags.Count <= 10)
            .WithMessage("Maximum 10 tags are allowed")
            .Must(tags => tags == null || tags.All(tag => tag.Length <= 30))
            .WithMessage("Tag length must not exceed 30 characters");
    }
} 