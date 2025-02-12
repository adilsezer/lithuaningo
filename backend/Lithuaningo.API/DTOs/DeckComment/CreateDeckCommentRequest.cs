using System.ComponentModel.DataAnnotations;
using Lithuaningo.API.Validators;

namespace Lithuaningo.API.DTOs.DeckComment
{
    /// <summary>
    /// Request to create a new deck comment
    /// </summary>
    public class CreateDeckCommentRequest
    {
        /// <summary>
        /// The deck identifier
        /// </summary>
        [Required(ErrorMessage = "Deck ID is required")]
        [ValidGuid(ErrorMessage = "Invalid Deck ID format")]
        public string DeckId { get; set; } = string.Empty;

        /// <summary>
        /// The user identifier
        /// </summary>
        [Required(ErrorMessage = "User ID is required")]
        [ValidGuid(ErrorMessage = "Invalid User ID format")]
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// The deck comment content
        /// </summary>
        [Required(ErrorMessage = "Content is required")]
        [StringLength(1000, MinimumLength = 1, ErrorMessage = "Content must be between 1 and 1000 characters")]
        public string Content { get; set; } = string.Empty;
    }
} 