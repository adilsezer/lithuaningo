using System;
using System.Collections.Generic;

namespace Lithuaningo.API.DTOs.Word
{
    /// <summary>
    /// Represents a lemma (dictionary form) response with its definitions and examples
    /// </summary>
    public class LemmaResponse
    {
        /// <summary>
        /// The unique identifier of the lemma
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The lemma word (dictionary form)
        /// </summary>
        public string Word { get; set; } = string.Empty;

        /// <summary>
        /// Part of speech (e.g., noun, verb, adjective)
        /// </summary>
        public string PartOfSpeech { get; set; } = string.Empty;

        /// <summary>
        /// List of definitions for this lemma
        /// </summary>
        public List<string> Definitions { get; set; } = new();

        /// <summary>
        /// List of example sentences using this lemma
        /// </summary>
        public List<string> Examples { get; set; } = new();

        /// <summary>
        /// When this lemma was created
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
} 