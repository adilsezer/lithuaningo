using System;
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
    public class SupabaseUserProfileService : IUserProfileService
    {
        private readonly Client _supabaseClient;
        private readonly ICacheService _cache;
        private readonly CacheSettings _cacheSettings;
        private const string CacheKeyPrefix = "user-profile:";
        private readonly ILogger<SupabaseUserProfileService> _logger;

        public SupabaseUserProfileService(
            ISupabaseService supabaseService,
            ICacheService cache,
            IOptions<CacheSettings> cacheSettings,
            ILogger<SupabaseUserProfileService> logger)
        {
            _supabaseClient = supabaseService.Client;
            _cache = cache;
            _cacheSettings = cacheSettings.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<UserProfile?> GetUserProfileAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            var cacheKey = $"{CacheKeyPrefix}{userGuid}";
            var cached = await _cache.GetAsync<UserProfile>(cacheKey);

            if (cached != null)
            {
                _logger.LogInformation("Retrieved user profile {UserId} from cache", userId);
                return cached;
            }

            try
            {
                var response = await _supabaseClient
                    .From<UserProfile>()
                    .Where(u => u.Id == userGuid)
                    .Get();

                var user = response.Models.FirstOrDefault();
                if (user != null)
                {
                    await _cache.SetAsync(cacheKey, user,
                        TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                    _logger.LogInformation("Retrieved and cached user profile {UserId}", userId);
                }
                else
                {
                    _logger.LogInformation("User profile {UserId} not found", userId);
                }

                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user profile {UserId}", userId);
                throw;
            }
        }

        public async Task<UserProfile> CreateUserProfileAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                throw new ArgumentException("Invalid user ID format", nameof(userId));
            }

            try
            {
                // Check if the user profile already exists
                var existingUser = await GetUserProfileAsync(userId);
                if (existingUser != null)
                {
                    throw new InvalidOperationException("User profile already exists");
                }

                var user = new UserProfile
                {
                    Id = userGuid,
                    Email = string.Empty,
                    FullName = string.Empty,
                    AvatarUrl = null,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    LastLoginAt = DateTime.UtcNow
                };

                var response = await _supabaseClient
                    .From<UserProfile>()
                    .Insert(user);

                var createdUser = response.Models.First();

                // Cache the new user profile
                var cacheKey = $"{CacheKeyPrefix}{userGuid}";
                await _cache.SetAsync(cacheKey, createdUser,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Created and cached new user profile {UserId}", userId);

                return createdUser;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user profile {UserId}", userId);
                throw;
            }
        }

        public async Task<UserProfile> UpdateUserProfileAsync(UserProfile userProfile)
        {
            if (userProfile == null)
            {
                throw new ArgumentNullException(nameof(userProfile));
            }

            try
            {
                var updatedProfile = new UserProfile
                {
                    Id = userProfile.Id,
                    Email = userProfile.Email,
                    FullName = userProfile.FullName,
                    AvatarUrl = userProfile.AvatarUrl,
                    UpdatedAt = DateTime.UtcNow,
                    CreatedAt = userProfile.CreatedAt,
                    LastLoginAt = userProfile.LastLoginAt
                };

                var response = await _supabaseClient
                    .From<UserProfile>()
                    .Where(u => u.Id == userProfile.Id)
                    .Update(updatedProfile);

                var updated = response.Models.First();

                // Update cache with new data
                var cacheKey = $"{CacheKeyPrefix}{userProfile.Id}";
                await _cache.SetAsync(cacheKey, updated,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Updated and cached user profile {UserId}", userProfile.Id);

                return updated;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile {UserId}", userProfile.Id);
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
                await _supabaseClient
                    .From<UserProfile>()
                    .Where(u => u.Id == userGuid)
                    .Delete();

                // Remove from cache
                var cacheKey = $"{CacheKeyPrefix}{userGuid}";
                await _cache.RemoveAsync(cacheKey);
                _logger.LogInformation("Deleted user profile {UserId}", userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user profile {UserId}", userId);
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
                var user = await GetUserProfileAsync(userId);
                if (user == null)
                {
                    throw new InvalidOperationException("User profile not found");
                }

                var updatedProfile = new UserProfile
                {
                    Id = userGuid,
                    LastLoginAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Email = user.Email,
                    FullName = user.FullName,
                    AvatarUrl = user.AvatarUrl,
                    CreatedAt = user.CreatedAt
                };

                var response = await _supabaseClient
                    .From<UserProfile>()
                    .Where(u => u.Id == userGuid)
                    .Update(updatedProfile);

                var updated = response.Models.First();

                // Update cache with new data
                var cacheKey = $"{CacheKeyPrefix}{userGuid}";
                await _cache.SetAsync(cacheKey, updated,
                    TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes));
                _logger.LogInformation("Updated last login and cached user profile {UserId}", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating last login for user {UserId}", userId);
                throw;
            }
        }
    }
}
