using System;
using System.Collections.Generic;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.DTOs.Flashcard
{
    /// <summary>
    /// Response containing flashcard information to be sent to frontend
    /// </summary>
    public class FlashcardResponse
    {
        /// <summary>
        /// The unique identifier for the flashcard
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The front text of the flashcard (question)
        /// </summary>
        public string FrontText { get; set; } = string.Empty;

        /// <summary>
        /// The back text of the flashcard (answer)
        /// </summary>
        public string BackText { get; set; } = string.Empty;

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

        /// <summary>
        /// Additional notes for the flashcard
        /// </summary>
        public string Notes { get; set; } = string.Empty;

        /// <summary>
        /// Categories this flashcard belongs to
        /// </summary>
        public List<FlashcardCategory> Categories { get; set; } = new();

        /// <summary>
        /// The difficulty level of the flashcard
        /// </summary>
        public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Basic;

        /// <summary>
        /// Indicates whether the flashcard has been verified by an admin
        /// </summary>
        public bool IsVerified { get; set; } = false;
    }
}