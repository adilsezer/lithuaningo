using System;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Lithuaningo.API.Models
{
    [Table("user_profiles")]
    public class UserProfile : BaseModel
    {
        [PrimaryKey("id")]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("email_verified")]
        public bool EmailVerified { get; set; }

        [Column("full_name")]
        public string FullName { get; set; } = string.Empty;

        [Column("avatar_url")]
        public string? AvatarUrl { get; set; }

        [Column("last_login_at")]
        public DateTime LastLoginAt { get; set; }

        [Column("is_admin")]
        public bool IsAdmin { get; set; }

        [Column("is_premium")]
        public bool IsPremium { get; set; }

        [Column("auth_provider")]
        public string AuthProvider { get; set; } = string.Empty;
    }
}
