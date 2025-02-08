using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.Word
{
    /// <summary>
    /// Represents a word form response with its grammatical attributes
    /// </summary>
    public class WordFormResponse
    {
        /// <summary>
        /// The unique identifier of the word form
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The actual word form
        /// </summary>
        public string Word { get; set; } = string.Empty;

        /// <summary>
        /// Reference to the base lemma (dictionary form) of this word
        /// </summary>
        public Guid LemmaId { get; set; }

        /// <summary>
        /// Grammatical attributes of the word form (e.g., case, number, tense)
        /// </summary>
        public Dictionary<string, string> Attributes { get; set; } = new();

        /// <summary>
        /// When this word form was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Human-readable time elapsed since creation
        /// </summary>
        public string TimeAgo { get; set; } = string.Empty;

        /// <summary>
        /// When this word form was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
} 