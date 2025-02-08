using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.UserProfile
{
    public class UpdateUserProfileRequest
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Full name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Full name must be between 2 and 100 characters")]
        public string FullName { get; set; } = string.Empty;

        public string? AvatarUrl { get; set; }
    }
}
