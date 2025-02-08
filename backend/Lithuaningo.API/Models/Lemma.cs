using System.Text.Json;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace Lithuaningo.API.Models;

[Table("lemmas")]
public class Lemma : BaseModel
{
    [PrimaryKey("id")]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("word")]
    public string Word { get; set; } = string.Empty;

    [Column("part_of_speech")]
    public string PartOfSpeech { get; set; } = string.Empty;

    [Column("definitions")]
    public JsonDocument Definitions { get; set; } = JsonDocument.Parse("{}");

    [Column("examples")]
    public JsonDocument? Examples { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
} 