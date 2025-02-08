using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.Flashcard
{
    public class UpdateFlashcardRequest
    {
        [Required]
        [StringLength(500)]
        public string FrontText { get; set; } = string.Empty;

        [Required]
        [StringLength(1000)]
        public string BackText { get; set; } = string.Empty;
    }
}