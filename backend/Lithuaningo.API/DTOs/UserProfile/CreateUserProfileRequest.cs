using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.UserProfile
{
    public class CreateUserProfileRequest
    {
        [Required(ErrorMessage = "User ID is required")]
        public string UserId { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email verified is required")]
        public bool EmailVerified { get; set; }

        [Required(ErrorMessage = "Full name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Full name must be between 2 and 100 characters")]
        public string FullName { get; set; } = string.Empty;

        public string? AvatarUrl { get; set; }

        [Required(ErrorMessage = "Is admin is required")]
        public bool IsAdmin { get; set; }

        [Required(ErrorMessage = "Is premium is required")]
        public bool IsPremium { get; set; }

        public DateTime? PremiumExpiresAt { get; set; }
    }
}
