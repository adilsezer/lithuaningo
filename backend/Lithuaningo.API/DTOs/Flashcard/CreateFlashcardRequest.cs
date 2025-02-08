using System;
using System.ComponentModel.DataAnnotations;
using Lithuaningo.API.Validators;

namespace Lithuaningo.API.DTOs.Flashcard
{
    public class CreateFlashcardRequest
    {
        [Required]
        [ValidGuid(ErrorMessage = "Invalid Deck ID format")]
        public string DeckId { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string FrontText { get; set; } = string.Empty;

        [Required]
        [StringLength(1000)]
        public string BackText { get; set; } = string.Empty;
    }
}