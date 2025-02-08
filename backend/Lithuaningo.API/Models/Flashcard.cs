using System;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace Lithuaningo.API.Models
{
    [Table("flashcards")]
    public class Flashcard : BaseModel
    {
        [PrimaryKey("id")]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("deck_id")]
        public Guid DeckId { get; set; }

        [Column("front_text")]
        public string FrontText { get; set; } = string.Empty;

        [Column("back_text")]
        public string BackText { get; set; } = string.Empty;

        [Column("review_count")]
        public int ReviewCount { get; set; }

        [Column("last_reviewed_at")]
        public DateTime? LastReviewedAt { get; set; }

        [Column("correct_rate")]
        public double? CorrectRate { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}
