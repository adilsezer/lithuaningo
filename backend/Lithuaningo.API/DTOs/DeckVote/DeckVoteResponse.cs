using System;

namespace Lithuaningo.API.DTOs.DeckVote
{
    /// <summary>
    /// Response containing deck vote information
    /// </summary>
    public class DeckVoteResponse
    {
        /// <summary>
        /// The deck identifier
        /// </summary>
        public Guid DeckId { get; set; }

        /// <summary>
        /// The user identifier who voted
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// The username of the user who voted
        /// </summary>
        public string Username { get; set; } = string.Empty;

        /// <summary>
        /// Whether the vote is an upvote
        /// </summary>
        public bool IsUpvote { get; set; }

        /// <summary>
        /// When this vote was created
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
} 