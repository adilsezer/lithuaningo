using System;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace Lithuaningo.API.Models
{
    [Table("decks")]
    public class Deck : BaseModel
    {
        [PrimaryKey("id")]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("user_id")]
        public Guid UserId { get; set; }

        [Column("user_name")]
        public string UserName { get; set; } = string.Empty;

        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("category")]
        public string Category { get; set; } = string.Empty;

        [Column("tags")]
        public string[] Tags { get; set; } = Array.Empty<string>();

        [Column("flashcard_count")]
        public int FlashcardCount { get; set; }

        [Column("rating")]
        public double Rating { get; set; }

        [Column("image_url")]
        public string? ImageUrl { get; set; }

        [Column("is_public")]
        public bool IsPublic { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}
