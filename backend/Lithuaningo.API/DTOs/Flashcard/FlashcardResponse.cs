using System;

namespace Lithuaningo.API.DTOs.Flashcard
{
    /// <summary>
    /// Response containing flashcard information
    /// </summary>
    public class FlashcardResponse
    {
        /// <summary>
        /// The unique identifier for the flashcard
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The deck identifier this flashcard belongs to
        /// </summary>
        public Guid DeckId { get; set; }

        /// <summary>
        /// The front word of the flashcard (question)
        /// </summary>
        public string FrontWord { get; set; } = string.Empty;

        /// <summary>
        /// The back word of the flashcard (answer)
        /// </summary>
        public string BackWord { get; set; } = string.Empty;

        /// <summary>
        /// The example sentence of the flashcard
        /// </summary>
        public string ExampleSentence { get; set; } = string.Empty;

        /// <summary>
        /// The example sentence translation of the flashcard
        /// </summary>
        public string ExampleSentenceTranslation { get; set; } = string.Empty;
        
        /// <summary>
        /// URL to the flashcard's image
        /// </summary>
        public string ImageUrl { get; set; } = string.Empty;

        /// <summary>
        /// URL to the flashcard's audio
        /// </summary>
        public string AudioUrl { get; set; } = string.Empty;
    }
} 