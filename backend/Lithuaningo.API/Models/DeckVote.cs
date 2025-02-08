using System;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace Lithuaningo.API.Models
{
    [Table("deck_votes")]
    public class DeckVote : BaseModel
    {
        [PrimaryKey("id")]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("deck_id")]
        public Guid DeckId { get; set; }

        [Column("user_id")]
        public Guid UserId { get; set; }

        [Column("is_upvote")]
        public bool IsUpvote { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}
