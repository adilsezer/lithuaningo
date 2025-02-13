using System;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace Lithuaningo.API.Models
{
    [Table("deck_reports")]
    public class DeckReport : BaseModel
    {
        [PrimaryKey("id")]
        [Column("id")]
        public Guid Id { get; set; }
        
        // The reported deck's ID.
        [Column("deck_id")]
        public Guid DeckId { get; set; }

        [Column("user_id")]
        public Guid UserId { get; set; }
        
        // Reviewer is optional – make nullable.
        [Column("reviewer_id")]
        public Guid? ReviewerId { get; set; }

        [Column("reason")]
        public string Reason { get; set; } = string.Empty;
        
        [Column("details")]
        public string Details { get; set; } = string.Empty;
        
        // Status (e.g., "pending", "resolved", etc.)
        [Column("status")]
        public string Status { get; set; } = "pending";
        
        [Column("resolution")]
        public string Resolution { get; set; } = string.Empty;
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}
