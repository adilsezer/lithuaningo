using Google.Cloud.Firestore;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Interfaces;

namespace Lithuaningo.API.Services
{
    public class ReportService : IReportService
    {
        private readonly FirestoreDb _db;
        private const string CollectionName = "reports";

        public ReportService(FirestoreDb db)
        {
            _db = db;
        }

        public async Task<string> CreateReportAsync(Report report)
        {
            var docRef = _db.Collection(CollectionName).Document();
            report.Id = docRef.Id;
            report.CreatedAt = DateTime.UtcNow;
            report.Status = "pending";
            await docRef.SetAsync(report);
            return docRef.Id;
        }

        public async Task<List<Report>> GetReportsByStatusAsync(string status)
        {
            var snapshot = await _db.Collection(CollectionName)
                .WhereEqualTo("status", status)
                .GetSnapshotAsync();
            return snapshot.Documents.Select(d => d.ConvertTo<Report>()).ToList();
        }

        public async Task<List<Report>> GetContentReportsAsync(string contentType, string contentId)
        {
            var snapshot = await _db.Collection(CollectionName)
                .WhereEqualTo("contentType", contentType)
                .WhereEqualTo("contentId", contentId)
                .GetSnapshotAsync();
            return snapshot.Documents.Select(d => d.ConvertTo<Report>()).ToList();
        }

        public async Task<Report?> GetReportByIdAsync(string id)
        {
            var docRef = _db.Collection(CollectionName).Document(id);
            var snapshot = await docRef.GetSnapshotAsync();
            return snapshot.Exists ? snapshot.ConvertTo<Report>() : null;
        }

        public async Task<List<Report>> GetPendingReportsAsync(int limit = 50)
        {
            var snapshot = await _db.Collection(CollectionName)
                .WhereEqualTo("status", "pending")
                .Limit(limit)
                .GetSnapshotAsync();
            return snapshot.Documents.Select(d => d.ConvertTo<Report>()).ToList();
        }

        public async Task UpdateReportStatusAsync(string id, string status, string reviewedBy, string? resolution)
        {
            var docRef = _db.Collection(CollectionName).Document(id);
            var updates = new Dictionary<string, object>
            {
                { "status", status },
                { "reviewedBy", reviewedBy },
                { "reviewedAt", DateTime.UtcNow }
            };

            if (!string.IsNullOrEmpty(resolution))
            {
                updates["resolution"] = resolution;
            }

            await docRef.UpdateAsync(updates);
        }
    }
} 