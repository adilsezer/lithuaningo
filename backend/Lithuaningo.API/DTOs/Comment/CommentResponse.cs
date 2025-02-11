using System;

namespace Lithuaningo.API.DTOs.Comment
{
    /// <summary>
    /// Response containing comment information
    /// </summary>
    public class CommentResponse
    {
        /// <summary>
        /// The deck identifier
        /// </summary>
        public Guid DeckId { get; set; }

        /// <summary>
        /// The user identifier who created the comment
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// The comment content
        /// </summary>
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// When this comment was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When this comment was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
} 