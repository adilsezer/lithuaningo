using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.DeckReport;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IDeckReportService
    {
        /// <summary>
        /// Gets reports by their status
        /// </summary>
        Task<List<DeckReportResponse>> GetReportsByStatusAsync(string status);

        /// <summary>
        /// Gets all reports for a specific deck
        /// </summary>
        Task<List<DeckReportResponse>> GetDeckReportsAsync(Guid deckId);

        /// <summary>
        /// Gets a specific report by its ID
        /// </summary>
        Task<DeckReportResponse?> GetReportByIdAsync(string reportId);

        /// <summary>
        /// Creates a new deck report
        /// </summary>
        Task<string> CreateReportAsync(CreateDeckReportRequest request);

        /// <summary>
        /// Gets pending reports with optional limit
        /// </summary>
        Task<List<DeckReportResponse>> GetPendingReportsAsync(int limit = 50);

        /// <summary>
        /// Updates the status of a report
        /// </summary>
        Task UpdateReportStatusAsync(string reportId, string status, string reviewerId, string? resolution);

        /// <summary>
        /// Deletes a report
        /// </summary>
        Task DeleteReportAsync(string reportId);
    }
}
