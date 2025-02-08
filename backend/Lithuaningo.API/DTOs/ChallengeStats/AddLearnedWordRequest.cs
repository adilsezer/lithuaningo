using System.ComponentModel.DataAnnotations;
using Lithuaningo.API.Validators;

namespace Lithuaningo.API.DTOs.ChallengeStats
{
    /// <summary>
    /// Request to add a learned word to a user's profile
    /// </summary>
    public class AddLearnedWordRequest
    {
        /// <summary>
        /// The ID of the word that was learned
        /// </summary>
        [Required(ErrorMessage = "Word ID is required")]
        [ValidGuid(ErrorMessage = "Invalid Word ID format")]
        public string WordId { get; set; } = string.Empty;
    }
} 