using System;

namespace Lithuaningo.API.DTOs.DeckComment
{
    /// <summary>
    /// Response containing deck comment information
    /// </summary>
    public class DeckCommentResponse
    {
        /// <summary>
        /// The unique identifier for the comment
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The deck identifier
        /// </summary>
        public Guid DeckId { get; set; }

        /// <summary>
        /// The user identifier who created the deck comment
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// The username of the user who created the deck comment
        /// </summary>
        public string Username { get; set; } = string.Empty;

        /// <summary>
        /// The deck comment content
        /// </summary>
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// When this deck comment was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When this deck comment was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
} 