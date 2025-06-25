using Lithuaningo.API.DTOs.Admin;

namespace Lithuaningo.API.Services.Admin
{
    /// <summary>
    /// Service for validating and fixing data integrity issues in the application.
    /// </summary>
    public interface IDataIntegrityService
    {
        /// <summary>
        /// Validates and optionally fixes data integrity issues in flashcards and challenge questions.
        /// </summary>
        /// <param name="fixIssues">If true, automatically fixes found issues. If false, only reports issues.</param>
        /// <returns>A report of issues found and actions taken.</returns>
        Task<DataIntegrityReport> ValidateAndFixDataAsync(bool fixIssues);
    }
}