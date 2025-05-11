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
        /// Gets all user profiles
        /// </summary>
        Task<IEnumerable<UserProfileResponse>> GetUserProfilesAsync();

        /// <summary>
        /// Updates a user's premium status based on webhook event.
        /// </summary>
        /// <param name="userId">The user identifier (App User ID from RevenueCat)</param>
        /// <param name="isPremium">Whether the user should be considered premium</param>
        /// <returns>The updated user profile or null if user not found</returns>
        Task<UserProfileResponse?> UpdatePremiumStatusFromWebhookAsync(string userId, bool isPremium);
    }
}
