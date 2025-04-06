using Lithuaningo.API.DTOs.UserProfile;

namespace Lithuaningo.API.Services.UserProfile
{
    public interface IUserProfileService
    {
        /// <summary>
        /// Gets a user profile by ID
        /// </summary>
        Task<UserProfileResponse?> GetUserProfileAsync(string userId);

        /// <summary>
        /// Updates an existing user profile
        /// </summary>
        Task<UserProfileResponse> UpdateUserProfileAsync(string userId, UpdateUserProfileRequest request);

        /// <summary>
        /// Deletes a user profile
        /// </summary>
        Task<bool> DeleteUserProfileAsync(string userId);

        /// <summary>
        /// Updates the last login timestamp for a user
        /// </summary>
        Task UpdateLastLoginAsync(string userId);

        /// <summary>
        /// Gets all user profiles
        /// </summary>
        Task<IEnumerable<UserProfileResponse>> GetUserProfilesAsync();
    }
}
