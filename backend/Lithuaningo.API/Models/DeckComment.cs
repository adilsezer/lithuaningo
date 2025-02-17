using System;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace Lithuaningo.API.Models
{
    [Table("deck_comments")]
    public class DeckComment : BaseModel
    {
        [PrimaryKey("id")]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("deck_id")]
        public Guid DeckId { get; set; }

        [Column("user_id")]
        public Guid UserId { get; set; }

        [Column("content")]
        public string Content { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [JsonProperty("user_profiles")]
        public UserProfile? UserProfile { get; set; }
    }
}
