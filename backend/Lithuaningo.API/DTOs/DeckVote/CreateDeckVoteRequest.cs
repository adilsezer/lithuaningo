using System;
using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.DeckVote
{
    /// <summary>
    /// Request to create a new deck vote
    /// </summary>
    public class CreateDeckVoteRequest
    {
        /// <summary>
        /// The deck identifier
        /// </summary>
        [Required(ErrorMessage = "Deck ID is required")]
        public Guid DeckId { get; set; }

        /// <summary>
        /// The user identifier who is voting
        /// </summary>
        [Required(ErrorMessage = "User ID is required")]
        public Guid UserId { get; set; }

        /// <summary>
        /// Whether the vote is an upvote
        /// </summary>
        public bool IsUpvote { get; set; }
    }
} 