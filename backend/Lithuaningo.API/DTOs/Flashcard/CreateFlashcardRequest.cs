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
        /// The deck identifier this flashcard belongs to
        /// </summary>
        [Required]
        public Guid DeckId { get; set; }

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
    }
}