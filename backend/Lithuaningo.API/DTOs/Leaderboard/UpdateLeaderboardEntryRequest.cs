using System.ComponentModel.DataAnnotations;
using Lithuaningo.API.Validators;

namespace Lithuaningo.API.DTOs.Leaderboard
{
    public class UpdateLeaderboardEntryRequest
    {
        [Required(ErrorMessage = "User ID is required")]
        [ValidGuid(ErrorMessage = "Invalid User ID format")]
        public string UserId { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
        public string Name { get; set; } = string.Empty;

        [Range(0, int.MaxValue, ErrorMessage = "Score must be a non-negative number")]
        public int Score { get; set; }
    }
}