using Lithuaningo.API.Models;
using Lithuaningo.API.DTOs.Announcement;
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
using AutoMapper;

namespace Lithuaningo.API.Services
{
    public class AnnouncementService : IAnnouncementService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "announcement:";
        private readonly ILogger<AnnouncementService> _logger;
        private readonly IMapper _mapper;
        private readonly CacheInvalidator _cacheInvalidator;

        public AnnouncementService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<AnnouncementService> logger,
            IMapper mapper,
            CacheInvalidator cacheInvalidator)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _cacheInvalidator = cacheInvalidator ?? throw new ArgumentNullException(nameof(cacheInvalidator));
        }

        public async Task<IEnumerable<AnnouncementResponse>> GetAnnouncementsAsync()
        {
            var cacheKey = $"{CacheKeyPrefix}all";
            var cached = await _cache.GetAsync<IEnumerable<AnnouncementResponse>>(cacheKey);

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
                var announcementResponses = _mapper.Map<IEnumerable<AnnouncementResponse>>(announcements);

                await _cache.SetAsync(cacheKey, announcementResponses,
                    TimeSpan.FromMinutes(_cacheSettings.AnnouncementCacheMinutes));
                _logger.LogInformation("Retrieved and cached {Count} announcements", announcements.Count);

                return announcementResponses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving announcements");
                throw;
            }
        }

        public async Task<AnnouncementResponse?> GetAnnouncementByIdAsync(string id)
        {
            if (!Guid.TryParse(id, out var announcementId))
            {
                throw new ArgumentException("Invalid announcement ID format", nameof(id));
            }

            var cacheKey = $"{CacheKeyPrefix}{announcementId}";
            var cached = await _cache.GetAsync<AnnouncementResponse>(cacheKey);

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
                    var announcementResponse = _mapper.Map<AnnouncementResponse>(announcement);
                    await _cache.SetAsync(cacheKey, announcementResponse,
                        TimeSpan.FromMinutes(_cacheSettings.AnnouncementCacheMinutes));
                    _logger.LogInformation("Retrieved and cached announcement {Id}", id);
                    return announcementResponse;
                }

                _logger.LogInformation("Announcement {Id} not found", id);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving announcement {Id}", id);
                throw;
            }
        }

        public async Task<AnnouncementResponse> CreateAnnouncementAsync(CreateAnnouncementRequest request)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            try
            {
                var announcement = new Announcement
                {
                    Id = Guid.NewGuid(),
                    Title = request.Title,
                    Content = request.Content,
                    IsActive = request.IsActive,
                    ValidUntil = request.ValidUntil,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var response = await _supabaseClient
                    .From<Announcement>()
                    .Insert(announcement);

                var createdAnnouncement = response.Models.First();
                var announcementResponse = _mapper.Map<AnnouncementResponse>(createdAnnouncement);

                // Replace direct cache removal with CacheInvalidator
                await _cacheInvalidator.InvalidateAnnouncementsAsync();
                _logger.LogInformation("Created new announcement with ID {Id}", announcement.Id);

                return announcementResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating announcement");
                throw;
            }
        }

        public async Task<AnnouncementResponse> UpdateAnnouncementAsync(string id, UpdateAnnouncementRequest request)
        {
            if (!Guid.TryParse(id, out var announcementId))
            {
                throw new ArgumentException("Invalid announcement ID format", nameof(id));
            }

            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            try
            {
                // Check that the announcement exists
                var existing = await _supabaseClient
                    .From<Announcement>()
                    .Where(a => a.Id == announcementId)
                    .Get();

                var existingAnnouncement = existing.Models.FirstOrDefault();
                if (existingAnnouncement == null)
                {
                    throw new ArgumentException("Announcement not found", nameof(id));
                }

                // Prepare the updated announcement
                var updatedAnnouncement = new Announcement
                {
                    Id = announcementId,
                    Title = request.Title,
                    Content = request.Content,
                    IsActive = request.IsActive,
                    ValidUntil = request.ValidUntil,
                    CreatedAt = existingAnnouncement.CreatedAt,
                    UpdatedAt = DateTime.UtcNow
                };

                var response = await _supabaseClient
                    .From<Announcement>()
                    .Where(a => a.Id == announcementId)
                    .Update(updatedAnnouncement);

                var updated = response.Models.First();
                var announcementResponse = _mapper.Map<AnnouncementResponse>(updated);

                // Replace cache invalidation code with:
                await _cacheInvalidator.InvalidateAnnouncementsAsync(id);

                _logger.LogInformation("Updated announcement {Id}", id);
                return announcementResponse;
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
                // Get the announcement first to verify it exists
                var announcement = await GetAnnouncementByIdAsync(id);
                if (announcement == null)
                {
                    _logger.LogInformation("Announcement {Id} not found for deletion", id);
                    return;
                }

                await _supabaseClient
                    .From<Announcement>()
                    .Where(a => a.Id == announcementId)
                    .Delete();

                // Replace cache invalidation code with:
                await _cacheInvalidator.InvalidateAnnouncementsAsync(announcement.Id.ToString());

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
