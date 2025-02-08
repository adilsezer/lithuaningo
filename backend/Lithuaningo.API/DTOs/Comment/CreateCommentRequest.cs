using System.ComponentModel.DataAnnotations;
using Lithuaningo.API.Validators;

namespace Lithuaningo.API.DTOs.Comment
{
    /// <summary>
    /// Request to create a new comment
    /// </summary>
    public class CreateCommentRequest
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
        /// The comment content
        /// </summary>
        [Required(ErrorMessage = "Content is required")]
        [StringLength(1000, MinimumLength = 1, ErrorMessage = "Content must be between 1 and 1000 characters")]
        public string Content { get; set; } = string.Empty;
    }
} 