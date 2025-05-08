using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Lithuaningo.API.Models
{
    [Table("cache_settings")]
    public class CacheSettingEntity : BaseModel
    {
        [PrimaryKey("id")]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("key")]
        public string Key { get; set; } = string.Empty;

        [Column("value_minutes")]
        public int ValueMinutes { get; set; }

        [Column("description")]
        public string? Description { get; set; }
    }
}