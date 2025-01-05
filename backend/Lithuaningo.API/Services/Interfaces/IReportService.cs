using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IReportService
    {
        Task<List<Report>> GetReportsByStatusAsync(string status);
        Task<List<Report>> GetContentReportsAsync(string contentType, string contentId);
        Task<Report?> GetReportByIdAsync(string id);
        Task<string> CreateReportAsync(Report report);
        Task UpdateReportStatusAsync(string id, string status, string reviewedBy, string? resolution);
        Task<List<Report>> GetPendingReportsAsync(int limit = 50);
    }
} 