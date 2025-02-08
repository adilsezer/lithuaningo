using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.Quiz
{
    public class CreateQuizQuestionRequest
    {
        [Required]
        public string Question { get; set; } = string.Empty;

        [Required]
        [MinLength(2)]
        public List<string> Options { get; set; } = new();

        [Required]
        public string CorrectAnswer { get; set; } = string.Empty;

        public string? Explanation { get; set; }

        public string? Category { get; set; }

        [Range(1, 5)]
        public int DifficultyLevel { get; set; } = 1;
    }
} 