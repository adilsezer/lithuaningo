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
        /// Whether the email is verified
        /// </summary>
        public bool EmailVerified { get; set; }

        /// <summary>
        /// User's full name
        /// </summary>
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// URL to user's avatar image
        /// </summary>
        public string? AvatarUrl { get; set; }

        /// <summary>
        /// When the user last logged in
        /// </summary>
        public DateTime? LastLoginAt { get; set; }

        /// <summary>
        /// Whether the user is an admin
        /// </summary>
        public bool IsAdmin { get; set; }

        /// <summary>
        /// Whether the user is a premium user
        /// </summary>
        public bool IsPremium { get; set; }

        /// <summary>
        /// When the user's premium expires
        /// </summary>
        public DateTime? PremiumExpiresAt { get; set; }

        /// <summary>
        /// The provider of the user's authentication
        /// </summary>
        public string AuthProvider { get; set; } = string.Empty;

        /// <summary>
        /// When this profile was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When this profile was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
} 