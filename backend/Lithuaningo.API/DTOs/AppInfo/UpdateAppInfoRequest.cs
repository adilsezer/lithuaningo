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
        /// Whether there's a mandatory update
        /// </summary>
        public bool HasMandatoryUpdate { get; set; }
    }
} 