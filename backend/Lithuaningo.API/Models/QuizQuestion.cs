using System;
using System.Collections.Generic;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace Lithuaningo.API.Models.Quiz
{
    [Table("quiz_questions")]
    public class QuizQuestion : BaseModel
    {
        [PrimaryKey("id")]
        [Column("id")]
        public Guid Id { get; set; }
        
        [Column("question")]
        public string Question { get; set; } = string.Empty;
        
        [Column("options")]
        public List<string> Options { get; set; } = new();
        
        [Column("correct_answer")]
        public string CorrectAnswer { get; set; } = string.Empty;
        
        [Column("example_sentence")]
        public string? ExampleSentence { get; set; }
        
        [Column("type")]
        public QuizQuestionType Type { get; set; }
    
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}
