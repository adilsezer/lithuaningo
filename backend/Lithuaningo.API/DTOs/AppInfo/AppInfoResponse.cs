using System;

namespace Lithuaningo.API.DTOs.AppInfo
{
    /// <summary>
    /// Response containing application information for a specific platform
    /// </summary>
    public class AppInfoResponse
    {
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
        /// Whether there's a mandatory update required
        /// </summary>
        public bool ForceUpdate { get; set; }

        /// <summary>
        /// URL to update the application (App Store or Play Store)
        /// </summary>
        public string? UpdateUrl { get; set; }

        /// <summary>
        /// Whether the app is in maintenance mode
        /// </summary>
        public bool IsMaintenance { get; set; }

        /// <summary>
        /// Optional maintenance message to display to users
        /// </summary>
        public string? MaintenanceMessage { get; set; }

        /// <summary>
        /// Release notes for the current version
        /// </summary>
        public string? ReleaseNotes { get; set; }
    }
} 