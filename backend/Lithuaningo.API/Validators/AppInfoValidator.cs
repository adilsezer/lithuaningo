using FluentValidation;
using Lithuaningo.API.DTOs.AppInfo;
using System.Text.RegularExpressions;

namespace Lithuaningo.API.Validators;

public class UpdateAppInfoValidator : AbstractValidator<UpdateAppInfoRequest>
{
    private static readonly Regex VersionRegex = new(@"^\d+\.\d+\.\d+$", RegexOptions.Compiled);

    public UpdateAppInfoValidator()
    {
        RuleFor(x => x.CurrentVersion)
            .NotEmpty().WithMessage("Current version is required")
            .Must(BeValidVersion).WithMessage("Version must be in format X.Y.Z");

        RuleFor(x => x.MinimumVersion)
            .NotEmpty().WithMessage("Minimum version is required")
            .Must(BeValidVersion).WithMessage("Version must be in format X.Y.Z")
            .Must((request, minVersion) => CompareVersions(minVersion, request.CurrentVersion) <= 0)
            .WithMessage("Minimum version cannot be greater than current version");
    }

    private bool BeValidVersion(string version)
    {
        return VersionRegex.IsMatch(version);
    }

    private int CompareVersions(string version1, string version2)
    {
        var v1Parts = version1.Split('.').Select(int.Parse).ToArray();
        var v2Parts = version2.Split('.').Select(int.Parse).ToArray();

        for (int i = 0; i < 3; i++)
        {
            if (v1Parts[i] != v2Parts[i])
            {
                return v1Parts[i].CompareTo(v2Parts[i]);
            }
        }

        return 0;
    }
} 