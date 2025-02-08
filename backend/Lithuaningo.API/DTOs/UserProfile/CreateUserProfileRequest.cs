using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.UserProfile
{
    public class CreateUserProfileRequest
    {
        [Required(ErrorMessage = "User ID is required")]
        public string UserId { get; set; } = string.Empty;
    }
}
