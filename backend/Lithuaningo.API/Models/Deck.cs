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

        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("category")]
        public string Category { get; set; } = string.Empty;

        [Column("tags")]
        public string[] Tags { get; set; } = Array.Empty<string>();

        [Column("created_by")]
        public Guid CreatedBy { get; set; }

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
