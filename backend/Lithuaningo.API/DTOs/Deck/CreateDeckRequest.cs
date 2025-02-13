using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.Deck
{
    /// <summary>
    /// Request to create a new deck
    /// </summary>
    public class CreateDeckRequest
    {
        /// <summary>
        /// The user identifier who is creating the deck
        /// </summary>
        [Required(ErrorMessage = "User ID is required")]
        public Guid UserId { get; set; }

        /// <summary>
        /// The deck title
        /// </summary>
        [Required(ErrorMessage = "Title is required")]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Title must be between 1 and 100 characters")]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// The deck description
        /// </summary>
        [Required(ErrorMessage = "Description is required")]
        [StringLength(1000, MinimumLength = 1, ErrorMessage = "Description must be between 1 and 1000 characters")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// The deck category
        /// </summary>
        [Required(ErrorMessage = "Category is required")]
        [StringLength(50, MinimumLength = 1, ErrorMessage = "Category must be between 1 and 50 characters")]
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
        /// URL to the deck's image
        /// </summary>
        public string? ImageUrl { get; set; }
    }
}
