using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using static Supabase.Postgrest.Constants;
using Supabase;

namespace Lithuaningo.API.Services
{
    public class SupabaseDeckReportService : IDeckReportService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "deck-report:";
        private readonly ILogger<SupabaseDeckReportService> _logger;

        public SupabaseDeckReportService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<SupabaseDeckReportService> logger)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<List<DeckReport>> GetReportsByStatusAsync(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                throw new ArgumentException("Status cannot be empty", nameof(status));
            }

            var cacheKey = $"{CacheKeyPrefix}status:{status.ToLowerInvariant()}";
            var cached = await _cache.GetAsync<List<DeckReport>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved reports from cache for status {Status}", status);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<DeckReport>()
                    .Filter(r => r.Status, Operator.Equals, status.ToLowerInvariant())
                    .Order(r => r.CreatedAt, Ordering.Descending)
                    .Get();

                var reports = response.Models;

                await _cache.SetAsync(cacheKey, reports,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} reports with status {Status}", 
                    reports.Count, status);

                return reports;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reports with status {Status}", status);
                throw;
            }
        }

        public async Task<List<DeckReport>> GetDeckReportsAsync(Guid deckId)
        {
            var cacheKey = $"{CacheKeyPrefix}deck:{deckId}";
            var cached = await _cache.GetAsync<List<DeckReport>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved reports from cache for deck {DeckId}", deckId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<DeckReport>()
                    .Filter(r => r.DeckId, Operator.Equals, deckId)
                    .Order(r => r.CreatedAt, Ordering.Descending)
                    .Get();

                var reports = response.Models;

                await _cache.SetAsync(cacheKey, reports,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} reports for deck {DeckId}", 
                    reports.Count, deckId);

                return reports;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reports for deck {DeckId}", deckId);
                throw;
            }
        }

        public async Task<string> CreateReportAsync(DeckReport report)
        {
            if (report == null)
            {
                throw new ArgumentNullException(nameof(report));
            }

            try
            {
                report.Id = Guid.NewGuid();
                report.CreatedAt = DateTime.UtcNow;
                report.UpdatedAt = DateTime.UtcNow;
                report.Status = "pending";

                var response = await _supabaseClient
                    .From<DeckReport>()
                    .Insert(report);

                var createdReport = response.Models.First();

                // Invalidate relevant cache entries
                await InvalidateReportCacheAsync(createdReport);
                _logger.LogInformation("Created new report {Id} for deck {DeckId}", 
                    createdReport.Id, createdReport.DeckId);

                return createdReport.Id.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating report for deck {DeckId}", report.DeckId);
                throw;
            }
        }

        public async Task UpdateReportStatusAsync(string id, string status, string? reviewedBy = null, string? resolution = null)
        {
            if (!Guid.TryParse(id, out var reportId))
            {
                throw new ArgumentException("Invalid report ID format", nameof(id));
            }

            if (string.IsNullOrWhiteSpace(status))
            {
                throw new ArgumentException("Status cannot be empty", nameof(status));
            }

            try
            {
                var response = await _supabaseClient
                    .From<DeckReport>()
                    .Where(r => r.Id == reportId)
                    .Get();

                var report = response.Models.FirstOrDefault();
                if (report == null)
                {
                    throw new ArgumentException("Report not found", nameof(id));
                }

                report.Status = status.ToLowerInvariant();
                report.UpdatedAt = DateTime.UtcNow;
                report.ReviewerId = reviewedBy != null && Guid.TryParse(reviewedBy, out var reviewerId) ? reviewerId : null;
                report.Resolution = resolution ?? string.Empty;

                var updateResponse = await _supabaseClient
                    .From<DeckReport>()
                    .Where(r => r.Id == reportId)
                    .Update(report);

                var updatedReport = updateResponse.Models.First();

                // Invalidate relevant cache entries
                await InvalidateReportCacheAsync(updatedReport);
                _logger.LogInformation("Updated report {Id} status to {Status}", reportId, status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating report {Id} status to {Status}", id, status);
                throw;
            }
        }

        private async Task InvalidateReportCacheAsync(DeckReport report)
        {
            var tasks = new List<Task>
            {
                // Invalidate status-based cache
                _cache.RemoveAsync($"{CacheKeyPrefix}status:{report.Status}"),
                
                // Invalidate deck-based cache
                _cache.RemoveAsync($"{CacheKeyPrefix}deck:{report.DeckId}")
            };

            await Task.WhenAll(tasks);
        }

        public async Task<DeckReport?> GetReportByIdAsync(string id)
        {
            if (!Guid.TryParse(id, out var reportId))
            {
                throw new ArgumentException("Invalid report ID format", nameof(id));
            }

            var cacheKey = $"{CacheKeyPrefix}{reportId}";
            var cached = await _cache.GetAsync<DeckReport>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved report {Id} from cache", id);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<DeckReport>()
                    .Where(r => r.Id == reportId)
                    .Get();

                var report = response.Models.FirstOrDefault();
                if (report != null)
                {
                    await _cache.SetAsync(cacheKey, report,
                        TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                    _logger.LogInformation("Retrieved and cached report {Id}", id);
                }
                else
                {
                    _logger.LogInformation("Report {Id} not found", id);
                }

                return report;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving report {Id}", id);
                throw;
            }
        }

        public async Task<List<DeckReport>> GetPendingReportsAsync(int limit = 50)
        {
            if (limit <= 0)
            {
                throw new ArgumentException("Limit must be greater than 0", nameof(limit));
            }

            var cacheKey = $"{CacheKeyPrefix}pending:{limit}";
            var cached = await _cache.GetAsync<List<DeckReport>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved pending reports from cache");
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<DeckReport>()
                    .Filter(r => r.Status, Operator.Equals, "pending")
                    .Order(r => r.CreatedAt, Ordering.Ascending)
                    .Limit(limit)
                    .Get();

                var reports = response.Models;

                await _cache.SetAsync(cacheKey, reports,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Retrieved and cached {Count} pending reports", reports.Count);

                return reports;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending reports");
                throw;
            }
        }

        public async Task DeleteReportAsync(string id)
        {
            if (!Guid.TryParse(id, out var reportId))
            {
                throw new ArgumentException("Invalid report ID format", nameof(id));
            }

            try
            {
                var report = await GetReportByIdAsync(id);
                if (report == null)
                {
                    throw new ArgumentException("Report not found", nameof(id));
                }

                await _supabaseClient
                    .From<DeckReport>()
                    .Where(r => r.Id == reportId)
                    .Delete();

                // Invalidate relevant cache entries
                await InvalidateReportCacheAsync(report);
                _logger.LogInformation("Deleted report {Id}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting report {Id}", id);
                throw;
            }
        }
    }
}
