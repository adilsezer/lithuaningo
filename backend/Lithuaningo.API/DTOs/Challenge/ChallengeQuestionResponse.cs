using System;
using System.Collections.Generic;
using Lithuaningo.API.Models;
namespace Lithuaningo.API.DTOs.Challenge
{
    public class ChallengeQuestionResponse
    {
        public Guid Id { get; set; }
        public string Question { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new();
        public string CorrectAnswer { get; set; } = string.Empty;
        public string? ExampleSentence { get; set; }
        public ChallengeQuestionType Type { get; set; }
    }
}