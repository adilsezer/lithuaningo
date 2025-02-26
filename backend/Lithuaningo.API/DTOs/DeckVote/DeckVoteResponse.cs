using System;

namespace Lithuaningo.API.DTOs.DeckVote
{
    /// <summary>
    /// Response containing deck vote information
    /// </summary>
    public class DeckVoteResponse
    {
        /// <summary>
        /// The unique identifier of the vote
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The deck identifier
        /// </summary>
        public Guid DeckId { get; set; }

        /// <summary>
        /// The user identifier who voted
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// Whether the vote is an upvote
        /// </summary>
        public bool IsUpvote { get; set; }

        /// <summary>
        /// When this vote was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When this vote was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
} 