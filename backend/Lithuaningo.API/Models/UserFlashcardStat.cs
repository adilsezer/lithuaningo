using System;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Lithuaningo.API.Models
{
    [Table("user_flashcard_stats")]
    public class UserFlashcardStat : BaseModel
    {
        [PrimaryKey("id")]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("user_id")]
        public string UserId { get; set; } = string.Empty;

        [Column("flashcard_id")]
        public Guid FlashcardId { get; set; }

        [Column("view_count")]
        public int ViewCount { get; set; } = 1;

        [Column("correct_count")]
        public int CorrectCount { get; set; } = 0;

        [Column("incorrect_count")]
        public int IncorrectCount { get; set; } = 0;

        [Column("last_answered_correctly")]
        public bool? LastAnsweredCorrectly { get; set; }

        [Column("mastery_level")]
        public int MasteryLevel { get; set; } = 0;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}