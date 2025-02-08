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
        
        [Column("explanation")]
        public string? Explanation { get; set; }
        
        [Column("type")]
        public string Type { get; set; } = "multiple_choice";
        
        /// <summary>
        /// The date for which this quiz applies (stored in UTC).
        /// </summary>
        [Column("quiz_date")]
        public DateTime QuizDate { get; set; }
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [Column("category")]
        public string? Category { get; set; }

        [Column("difficulty_level")]
        public int DifficultyLevel { get; set; }
    }
}
