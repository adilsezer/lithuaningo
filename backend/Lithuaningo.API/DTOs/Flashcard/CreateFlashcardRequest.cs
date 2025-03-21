using System;
using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.Flashcard
{
    /// <summary>
    /// Request to create a new flashcard
    /// </summary>
    public class CreateFlashcardRequest
    {
        /// <summary>
        /// The front word of the flashcard (question)
        /// </summary>
        [Required]
        [StringLength(500, MinimumLength = 1)]
        public string FrontWord { get; set; } = string.Empty;

        /// <summary>
        /// The back word of the flashcard (answer)
        /// </summary>
        [Required]
        [StringLength(500, MinimumLength = 1)]
        public string BackWord { get; set; } = string.Empty;

        /// <summary>
        /// The example sentence of the flashcard
        /// </summary>
        [Required]
        [StringLength(500, MinimumLength = 1)]
        public string ExampleSentence { get; set; } = string.Empty;

        /// <summary>
        /// The example sentence translation of the flashcard
        /// </summary>
        [Required]
        [StringLength(500, MinimumLength = 1)]
        public string ExampleSentenceTranslation { get; set; } = string.Empty;

        /// <summary>
        /// URL to the flashcard's image
        /// </summary>
        [StringLength(2048)]
        public string ImageUrl { get; set; } = string.Empty;

        /// <summary>
        /// URL to the flashcard's audio
        /// </summary>
        [StringLength(2048)]
        public string AudioUrl { get; set; } = string.Empty;
        
        /// <summary>
        /// Additional notes for the flashcard
        /// </summary>
        [StringLength(1000)]
        public string Notes { get; set; } = string.Empty;
        
        /// <summary>
        /// Language proficiency level (A1, A2, B1, B2, etc.)
        /// </summary>
        [StringLength(5)]
        public string Level { get; set; } = string.Empty;
    }
}