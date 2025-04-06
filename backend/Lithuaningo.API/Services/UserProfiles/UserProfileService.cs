using AutoMapper;
using Lithuaningo.API.DTOs.UserProfile;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Supabase;
using Microsoft.Extensions.Options;
using Supabase;

namespace Lithuaningo.API.Services.UserProfile
{
    public class UserProfileService : IUserProfileService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "user-profile:";
        private readonly ILogger<UserProfileService> _logger;
        private readonly IMapper _mapper;
        private readonly CacheInvalidator _cacheInvalidator;

        public UserProfileService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<UserProfileService> logger,
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

        public async Task<UserProfileResponse?> GetUserProfileAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            var cacheKey = $"{CacheKeyPrefix}{userId}";
            var cached = await _cache.GetAsync<UserProfileResponse>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved user profile from cache for user {UserId}", userId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<Models.UserProfile>()
                    .Where(u => u.Id == userGuid)
                    .Get();

                var profile = response.Models.FirstOrDefault();
                if (profile == null)
                {
                    return null;
                }

                var profileResponse = _mapper.Map<UserProfileResponse>(profile);
                await _cache.SetAsync(cacheKey, profileResponse,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));

                _logger.LogInformation("Retrieved and cached user profile for user {UserId}", userId);
                return profileResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user profile for user {UserId}", userId);
                throw;
            }
        }

        public async Task<UserProfileResponse> UpdateUserProfileAsync(string userId, UpdateUserProfileRequest request)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            try
            {
                var existingProfile = await _supabaseClient
                    .From<Models.UserProfile>()
                    .Where(u => u.Id == userGuid)
                    .Get();

                var profile = existingProfile.Models.FirstOrDefault();
                if (profile == null)
                {
                    throw new KeyNotFoundException($"User profile not found for ID {userId}");
                }

                _mapper.Map(request, profile);

                var response = await _supabaseClient
                    .From<Models.UserProfile>()
                    .Where(u => u.Id == userGuid)
                    .Update(profile);

                var updatedProfile = response.Models.First();
                var profileResponse = _mapper.Map<UserProfileResponse>(updatedProfile);

                await _cacheInvalidator.InvalidateUserProfileAsync(userId);

                _logger.LogInformation("Updated user profile for user {UserId}", userId);
                return profileResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile for user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> DeleteUserProfileAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            try
            {
                // Get the profile first to verify it exists
                var profile = await GetUserProfileAsync(userId);
                if (profile == null)
                {
                    _logger.LogInformation("User profile {UserId} not found for deletion", userId);
                    return false;
                }

                await _supabaseClient
                    .From<Models.UserProfile>()
                    .Where(u => u.Id == userGuid)
                    .Delete();

                await _cacheInvalidator.InvalidateUserProfileAsync(userId);

                _logger.LogInformation("Deleted user profile for user {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user profile for user {UserId}", userId);
                throw;
            }
        }

        public async Task UpdateLastLoginAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            try
            {
                var profile = new Models.UserProfile
                {
                    Id = userGuid,
                    LastLoginAt = DateTime.UtcNow
                };

                await _supabaseClient
                    .From<Models.UserProfile>()
                    .Where(u => u.Id == userGuid)
                    .Set(u => u.LastLoginAt, DateTime.UtcNow)
                    .Update();

                await _cacheInvalidator.InvalidateUserProfileAsync(userId);

                _logger.LogInformation("Updated last login for user {UserId}", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating last login for user {UserId}", userId);
                throw;
            }
        }

        public async Task<IEnumerable<UserProfileResponse>> GetUserProfilesAsync()
        {
            var cacheKey = $"{CacheKeyPrefix}all";
            var cached = await _cache.GetAsync<IEnumerable<UserProfileResponse>>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved all user profiles from cache");
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<Models.UserProfile>()
                    .Get();

                var profiles = response.Models;
                var profileResponses = _mapper.Map<IEnumerable<UserProfileResponse>>(profiles);

                await _cache.SetAsync(cacheKey, profileResponses,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));

                _logger.LogInformation("Retrieved and cached {Count} user profiles", profiles.Count);
                return profileResponses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all user profiles");
                throw;
            }
        }
    }
}
