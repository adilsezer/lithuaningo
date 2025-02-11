using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.AppInfo
{
    /// <summary>
    /// Request to update application information
    /// </summary>
    public class UpdateAppInfoRequest
    {
        /// <summary>
        /// Current version of the application
        /// </summary>
        [Required(ErrorMessage = "Current version is required")]
        [RegularExpression(@"^\d+\.\d+\.\d+$", ErrorMessage = "Version must be in format X.Y.Z")]
        public string CurrentVersion { get; set; } = string.Empty;

        /// <summary>
        /// Minimum supported version
        /// </summary>
        [Required(ErrorMessage = "Minimum version is required")]
        [RegularExpression(@"^\d+\.\d+\.\d+$", ErrorMessage = "Version must be in format X.Y.Z")]
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
        [StringLength(500, ErrorMessage = "Maintenance message cannot exceed 500 characters")]
        public string? MaintenanceMessage { get; set; }

        /// <summary>
        /// Release notes for the current version
        /// </summary>
        [StringLength(1000, ErrorMessage = "Release notes cannot exceed 1000 characters")]
        public string? ReleaseNotes { get; set; }
    }
} 