using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.DTOs.Flashcard
{
    /// <summary>
    /// Request containing flashcard information for admin updates
    /// </summary>
    public class UpdateFlashcardAdminRequest
    {
        [Required]
        public string FrontText { get; set; } = string.Empty;

        [Required]
        public string BackText { get; set; } = string.Empty;

        public string ExampleSentence { get; set; } = string.Empty;

        public string ExampleSentenceTranslation { get; set; } = string.Empty;

        public string ImageUrl { get; set; } = string.Empty;

        public string AudioUrl { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;

        [Required]
        public List<FlashcardCategory> Categories { get; set; } = new();

        [Required]
        public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Basic;

        [Required]
        public bool IsVerified { get; set; } = false;
    }
}