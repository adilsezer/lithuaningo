using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.ChallengeStats
{
    /// <summary>
    /// Request to add experience points to a user's profile
    /// </summary>
    public class AddExperienceRequest
    {
        /// <summary>
        /// Amount of experience points to add
        /// </summary>
        [Required]
        [Range(1, 1000, ErrorMessage = "Experience amount must be between 1 and 1000")]
        public int Amount { get; set; }
    }
} 