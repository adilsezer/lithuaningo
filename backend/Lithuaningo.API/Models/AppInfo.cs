using System;
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace Lithuaningo.API.Models
{
    [Table("app_info")]
    public class AppInfo : BaseModel
    {
        [PrimaryKey("id")]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("platform")]
        public string Platform { get; set; } = string.Empty;

        [Column("current_version")]
        public string CurrentVersion { get; set; } = string.Empty;

        [Column("minimum_version")]
        public string MinimumVersion { get; set; } = string.Empty;

        [Column("force_update")]
        public bool ForceUpdate { get; set; }

        [Column("update_url")]
        public string? UpdateUrl { get; set; }

        [Column("is_maintenance")]
        public bool IsMaintenance { get; set; }

        [Column("maintenance_message")]
        public string? MaintenanceMessage { get; set; }

        [Column("release_notes")]
        public string? ReleaseNotes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}
