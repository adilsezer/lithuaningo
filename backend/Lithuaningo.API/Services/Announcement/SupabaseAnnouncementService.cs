using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using static Supabase.Postgrest.Constants;
using Supabase;

namespace Lithuaningo.API.Services
{
    public class SupabaseAnnouncementService : IAnnouncementService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "announcement:";
        private readonly ILogger<SupabaseAnnouncementService> _logger;

        public SupabaseAnnouncementService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<SupabaseAnnouncementService> logger)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // Mapping method to allow for future transformation (currently one-to-one).
        private Announcement MapToAnnouncement(Announcement supabaseAnnouncement)
        {
            return new Announcement
            {
                Id = supabaseAnnouncement.Id,
                Title = supabaseAnnouncement.Title,
                Content = supabaseAnnouncement.Content,
                IsActive = supabaseAnnouncement.IsActive,
                CreatedAt = supabaseAnnouncement.CreatedAt,
                UpdatedAt = supabaseAnnouncement.UpdatedAt,
                ValidUntil = supabaseAnnouncement.ValidUntil
            };
        }

        public async Task<IEnumerable<Announcement>> GetAnnouncementsAsync()
        {
            var cacheKey = $"{CacheKeyPrefix}all";
            var cached = await _cache.GetAsync<IEnumerable<Announcement>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved announcements from cache");
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<Announcement>()
                    .Where(a => a.IsActive == true)
                    .Order("created_at", Ordering.Descending)
                    .Get();

                var announcements = response.Models;

                await _cache.SetAsync(cacheKey, announcements,
                    TimeSpan.FromMinutes(_cacheSettings.AnnouncementCacheMinutes));
                _logger.LogInformation("Retrieved and cached {Count} announcements", announcements.Count);

                return announcements;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving announcements");
                throw;
            }
        }

        public async Task<Announcement?> GetAnnouncementByIdAsync(string id)
        {
            if (!Guid.TryParse(id, out var announcementId))
            {
                throw new ArgumentException("Invalid announcement ID format", nameof(id));
            }

            var cacheKey = $"{CacheKeyPrefix}{announcementId}";
            var cached = await _cache.GetAsync<Announcement>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved announcement {Id} from cache", id);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<Announcement>()
                    .Where(a => a.Id == announcementId)
                    .Get();

                var announcement = response.Models.FirstOrDefault();
                if (announcement != null)
                {
                    await _cache.SetAsync(cacheKey, announcement,
                        TimeSpan.FromMinutes(_cacheSettings.AnnouncementCacheMinutes));
                    _logger.LogInformation("Retrieved and cached announcement {Id}", id);
                }
                else
                {
                    _logger.LogInformation("Announcement {Id} not found", id);
                }

                return announcement;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving announcement {Id}", id);
                throw;
            }
        }

        public async Task CreateAnnouncementAsync(Announcement announcement)
        {
            if (announcement == null)
            {
                throw new ArgumentNullException(nameof(announcement));
            }

            try
            {
                // Create a new announcement instance with timestamps
                var newAnnouncement = new Announcement
                {
                    Id = Guid.NewGuid(),
                    Title = announcement.Title,
                    Content = announcement.Content,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    ValidUntil = announcement.ValidUntil
                };

                var response = await _supabaseClient
                    .From<Announcement>()
                    .Insert(newAnnouncement);

                // Invalidate the cache for all announcements
                await _cache.RemoveAsync($"{CacheKeyPrefix}all");
                _logger.LogInformation("Created new announcement with ID {Id}", newAnnouncement.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating announcement");
                throw;
            }
        }

        public async Task UpdateAnnouncementAsync(string id, Announcement announcement)
        {
            if (!Guid.TryParse(id, out var announcementId))
            {
                throw new ArgumentException("Invalid announcement ID format", nameof(id));
            }

            if (announcement == null)
            {
                throw new ArgumentNullException(nameof(announcement));
            }

            try
            {
                // Check that the announcement exists
                var existing = await GetAnnouncementByIdAsync(id);
                if (existing == null)
                {
                    throw new ArgumentException("Announcement not found", nameof(id));
                }

                // Prepare the updated announcement
                var updatedAnnouncement = new Announcement
                {
                    Id = announcementId,
                    Title = announcement.Title,
                    Content = announcement.Content,
                    IsActive = announcement.IsActive,
                    ValidUntil = announcement.ValidUntil,
                    CreatedAt = existing.CreatedAt,
                    UpdatedAt = DateTime.UtcNow
                };

                await _supabaseClient
                    .From<Announcement>()
                    .Where(a => a.Id == announcementId)
                    .Update(updatedAnnouncement);

                // Invalidate both specific and list caches
                var cacheKey = $"{CacheKeyPrefix}{announcementId}";
                await _cache.RemoveAsync(cacheKey);
                await _cache.RemoveAsync($"{CacheKeyPrefix}all");

                _logger.LogInformation("Updated announcement {Id}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating announcement {Id}", id);
                throw;
            }
        }

        public async Task DeleteAnnouncementAsync(string id)
        {
            if (!Guid.TryParse(id, out var announcementId))
            {
                throw new ArgumentException("Invalid announcement ID format", nameof(id));
            }

            try
            {
                await _supabaseClient
                    .From<Announcement>()
                    .Where(a => a.Id == announcementId)
                    .Delete();

                // Invalidate both specific and list caches
                var cacheKey = $"{CacheKeyPrefix}{announcementId}";
                await _cache.RemoveAsync(cacheKey);
                await _cache.RemoveAsync($"{CacheKeyPrefix}all");

                _logger.LogInformation("Deleted announcement {Id}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting announcement {Id}", id);
                throw;
            }
        }
    }
}
