using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.UserProfile;

namespace Lithuaningo.API.Services.Interfaces
{
    public interface IUserProfileService
    {
        /// <summary>
        /// Gets a user profile by ID
        /// </summary>
        Task<UserProfileResponse?> GetUserProfileAsync(string userId);

        /// <summary>
        /// Creates a new user profile
        /// </summary>
        Task<UserProfileResponse> CreateUserProfileAsync(CreateUserProfileRequest request);

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
