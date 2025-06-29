using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Lithuaningo.API.Models
{
    [Table("challenge_questions")]
    public class ChallengeQuestion : BaseModel
    {
        [PrimaryKey("id")]
        [Column("id")]
        [JsonProperty("id")]
        public Guid Id { get; set; }

        [Column("question")]
        [JsonProperty("question")]
        public string Question { get; set; } = string.Empty;

        [Column("options")]
        [JsonProperty("options")]
        public List<string> Options { get; set; } = new();

        [Column("correct_answer")]
        [JsonProperty("correct_answer")]
        public string CorrectAnswer { get; set; } = string.Empty;

        [Column("example_sentence")]
        [JsonProperty("example_sentence")]
        public string? ExampleSentence { get; set; }

        [Column("type")]
        [JsonProperty("type")]
        public ChallengeQuestionType Type { get; set; }

        [Column("flashcard_id")]
        [JsonProperty("flashcard_id")]
        public Guid? FlashcardId { get; set; }

        [Column("explanation")]
        [JsonProperty("explanation")]
        public string? Explanation { get; set; }
    }
}
