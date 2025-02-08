using System;

namespace Lithuaningo.API.DTOs.UserProfile
{
    /// <summary>
    /// Response containing user profile information
    /// </summary>
    public class UserProfileResponse
    {
        /// <summary>
        /// The unique identifier
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// User's email address
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// User's full name
        /// </summary>
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// URL to user's avatar image
        /// </summary>
        public string? AvatarUrl { get; set; }

        /// <summary>
        /// Human-readable time elapsed since creation
        /// </summary>
        public string TimeAgo { get; set; } = string.Empty;

        /// <summary>
        /// Human-readable time since last login
        /// </summary>
        public string? LastLoginTimeAgo { get; set; }

        /// <summary>
        /// When this profile was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When this profile was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// When the user last logged in
        /// </summary>
        public DateTime? LastLoginAt { get; set; }
    }
} 