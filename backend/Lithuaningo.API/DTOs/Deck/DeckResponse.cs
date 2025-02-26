using System;
using System.Collections.Generic;

namespace Lithuaningo.API.DTOs.Deck
{
    /// <summary>
    /// Response containing deck information
    /// </summary>
    public class DeckResponse
    {
        /// <summary>
        /// The unique identifier of the deck
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The user identifier who created the deck
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// The username of the user who created the deck
        /// </summary>
        public string Username { get; set; } = string.Empty;

        /// <summary>
        /// The deck title
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// The deck description
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// The deck category
        /// </summary>
        public string Category { get; set; } = string.Empty;

        /// <summary>
        /// Tags associated with the deck
        /// </summary>
        public List<string> Tags { get; set; } = new();

        /// <summary>
        /// Whether the deck is public
        /// </summary>
        public bool IsPublic { get; set; }

        /// <summary>
        /// Total number of cards in the deck
        /// </summary>
        public int FlashcardsCount { get; set; }

        /// <summary>
        /// URL to the deck's image
        /// </summary>
        public string? ImageUrl { get; set; }

        /// <summary>
        /// When this deck was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When this deck was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
} 