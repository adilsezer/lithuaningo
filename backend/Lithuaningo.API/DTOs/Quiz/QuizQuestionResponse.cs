using System;
using System.Collections.Generic;

namespace Lithuaningo.API.DTOs.Quiz
{
    public class QuizQuestionResponse
    {
        public Guid Id { get; set; }
        public string Question { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new();
        public string CorrectAnswer { get; set; } = string.Empty;
        public string? Explanation { get; set; }
        public string Type { get; set; } = "multiple_choice";
        public DateTime QuizDate { get; set; }
        public string? Category { get; set; }
        public int DifficultyLevel { get; set; }
        public DateTime CreatedAt { get; set; }
    }
} 