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
        public string? ExampleSentence { get; set; }
        public QuizQuestionType Type { get; set; }
    }
} 