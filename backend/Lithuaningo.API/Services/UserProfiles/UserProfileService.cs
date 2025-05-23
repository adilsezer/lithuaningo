using AutoMapper;
using Lithuaningo.API.DTOs.UserProfile;
using Lithuaningo.API.Services.Cache;
using Lithuaningo.API.Services.Supabase;
using Lithuaningo.API.Utilities;
using Supabase;

namespace Lithuaningo.API.Services.UserProfile
{
    public class UserProfileService : IUserProfileService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly ICacheSettingsService _cacheSettingsService;
        private const string CacheKeyPrefix = "user-profile:";
        private readonly ILogger<UserProfileService> _logger;
        private readonly IMapper _mapper;
        private readonly CacheInvalidator _cacheInvalidator;

        public UserProfileService(
            ISupabaseService supabaseService,
            ICacheService cache,
            ICacheSettingsService cacheSettingsService,
            ILogger<UserProfileService> logger,
            IMapper mapper,
            CacheInvalidator cacheInvalidator)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettingsService = cacheSettingsService;
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
                var settings = await _cacheSettingsService.GetCacheSettingsAsync();
                await _cache.SetAsync(cacheKey, profileResponse,
                    TimeSpan.FromMinutes(settings.DefaultExpirationMinutes));

                return profileResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user profile");
                throw;
            }
        }

        public async Task<UserProfileResponse> UpdateUserProfileAsync(string userId, UpdateUserProfileRequest request)
        {
            ArgumentNullException.ThrowIfNull(request);

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

                return profileResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile");
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
                    return false;
                }

                await _supabaseClient
                    .From<Models.UserProfile>()
                    .Where(u => u.Id == userGuid)
                    .Delete();

                await _cacheInvalidator.InvalidateUserProfileAsync(userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user profile");
                throw;
            }
        }

        public async Task<IEnumerable<UserProfileResponse>> GetUserProfilesAsync()
        {
            var cacheKey = $"{CacheKeyPrefix}all";
            var cached = await _cache.GetAsync<IEnumerable<UserProfileResponse>>(cacheKey);

            if (cached != null)
            {
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<Models.UserProfile>()
                    .Get();

                var profiles = response.Models;
                var profileResponses = _mapper.Map<IEnumerable<UserProfileResponse>>(profiles);

                var settings = await _cacheSettingsService.GetCacheSettingsAsync();
                await _cache.SetAsync(cacheKey, profileResponses,
                    TimeSpan.FromMinutes(settings.DefaultExpirationMinutes));

                return profileResponses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all user profiles");
                throw;
            }
        }

        public async Task<UserProfileResponse?> UpdatePremiumStatusFromWebhookAsync(string userId, bool isPremium)
        {
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Received empty userId in webhook premium status update");
                return null;
            }

            Guid userGuid;

            if (!Guid.TryParse(userId, out userGuid))
            {
                _logger.LogError("Cannot map RevenueCat user ID to Supabase user ID. Update failed");
                return null;
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
                    _logger.LogWarning("User profile not found from RevenueCat webhook");
                    return null; // User not found
                }

                // Update premium status
                profile.IsPremium = isPremium;

                _logger.LogInformation("Updating premium status");

                // We explicitly set these rather than mapping from a request object
                var updateResponse = await _supabaseClient
                    .From<Models.UserProfile>()
                    .Where(u => u.Id == userGuid) // Ensure we are updating the correct record
                    .Update(profile);

                if (updateResponse.Models == null || !updateResponse.Models.Any())
                {
                    // Potentially throw an exception or handle this as a failure
                    _logger.LogError("Failed to update premium status. No rows updated.");
                    return null;
                }

                var updatedProfileModel = updateResponse.Models.First();
                var profileResponse = _mapper.Map<UserProfileResponse>(updatedProfileModel);

                await _cacheInvalidator.InvalidateUserProfileAsync(userId.ToString());
                _logger.LogInformation("Successfully updated premium status");

                return profileResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating premium status");
                throw; // Re-throw to let the caller (webhook controller) handle the HTTP response
            }
        }
    }
}
