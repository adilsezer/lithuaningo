using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IDeckReportService
    {
        Task<List<DeckReport>> GetReportsByStatusAsync(string status);
        Task<List<DeckReport>> GetDeckReportsAsync(Guid deckId);
        Task<DeckReport?> GetReportByIdAsync(string id);
        Task<string> CreateReportAsync(DeckReport report);
        Task UpdateReportStatusAsync(string id, string status, string? reviewedBy, string? resolution);
        Task<List<DeckReport>> GetPendingReportsAsync(int limit = 50);
        Task DeleteReportAsync(string id);
    }
}
