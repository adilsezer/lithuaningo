using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.DTOs.Quiz
{
    public class CreateQuizQuestionRequest
    {
        [Required(ErrorMessage = "Question is required")]
        [StringLength(500, MinimumLength = 10, ErrorMessage = "Question must be between 10 and 500 characters")]
        public string Question { get; set; } = string.Empty;

        [Required(ErrorMessage = "Options are required")]
        [MinLength(2, ErrorMessage = "At least 2 options are required")]
        [MaxLength(5, ErrorMessage = "Maximum 5 options are allowed")]
        public List<string> Options { get; set; } = new();

        [Required(ErrorMessage = "Correct answer is required")]
        public string CorrectAnswer { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Example sentence must not exceed 500 characters")]
        public string? ExampleSentence { get; set; }

        [Required(ErrorMessage = "Question type is required")]
        public QuizQuestionType Type { get; set; }
    }
} 