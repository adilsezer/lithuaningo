using System;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace Lithuaningo.API.Models
{
    [Table("flashcard_stats")]
    public class UserFlashcardStats : BaseModel
    {
        [PrimaryKey("id")]
        [Column("id")]
        public Guid Id { get; set; }
        
        [Column("user_id")]
        public Guid UserId { get; set; }
        
        [Column("flashcard_id")]
        public Guid FlashcardId { get; set; }
        
        [Column("confidence_level")]
        public int ConfidenceLevel { get; set; }
        
        [Column("next_review_at")]
        public DateTime? NextReviewAt { get; set; }
        
        [Column("last_reviewed_at")]
        public DateTime LastReviewedAt { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}