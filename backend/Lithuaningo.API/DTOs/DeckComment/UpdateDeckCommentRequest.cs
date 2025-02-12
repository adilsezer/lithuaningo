using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.DeckComment
{
    /// <summary>
    /// Request to update an existing deck comment
    /// </summary>
    public class UpdateDeckCommentRequest
    {
        /// <summary>
        /// The updated deck comment content
        /// </summary>
        [Required(ErrorMessage = "Content is required")]
        [StringLength(1000, MinimumLength = 1, ErrorMessage = "Content must be between 1 and 1000 characters")]
        public string Content { get; set; } = string.Empty;
    }
}
