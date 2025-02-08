using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.Flashcard
{
    public class UpdateReviewRequest
    {
        [Required]
        public bool WasCorrect { get; set; }
    }
}