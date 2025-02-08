using System;

namespace Lithuaningo.API.DTOs.AppInfo
{
    /// <summary>
    /// Response containing application information for a specific platform
    /// </summary>
    public class AppInfoResponse
    {
        /// <summary>
        /// The unique identifier
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The platform identifier (e.g., "ios", "android")
        /// </summary>
        public string Platform { get; set; } = string.Empty;

        /// <summary>
        /// Current version of the application
        /// </summary>
        public string CurrentVersion { get; set; } = string.Empty;

        /// <summary>
        /// Minimum supported version
        /// </summary>
        public string MinimumVersion { get; set; } = string.Empty;

        /// <summary>
        /// Whether there's a mandatory update
        /// </summary>
        public bool HasMandatoryUpdate { get; set; }

        /// <summary>
        /// When this info was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When this info was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
} 