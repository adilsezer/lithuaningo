using System.Text.Json;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;
namespace Lithuaningo.API.Models;

[Table("word_forms")]
public class WordForm : BaseModel
{
    [PrimaryKey("id")]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("word")]
    public string Word { get; set; } = string.Empty;

    [Column("lemma_id")]
    public Guid LemmaId { get; set; }

    [Column("attributes")]
    public JsonDocument Attributes { get; set; } = JsonDocument.Parse("{}");

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
} 