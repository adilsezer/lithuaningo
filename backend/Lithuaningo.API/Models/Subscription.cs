using System;
using System.Text.Json.Serialization;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Lithuaningo.API.Models
{
    [Table("subscriptions")]
    public class Subscription : BaseModel
    {
        [PrimaryKey("id")]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("user_id")]
        public Guid UserId { get; set; }

        [Column("is_premium")]
        public bool IsPremium { get; set; }

        [Column("subscription_status")]
        public string SubscriptionStatus { get; set; } = string.Empty;

        [Column("product_id")]
        public string? ProductId { get; set; }

        [Column("store")]
        public string? Store { get; set; }

        [Column("started_at")]
        public DateTime? StartedAt { get; set; }

        [Column("expires_at")]
        public DateTime? ExpiresAt { get; set; }

        [Column("transaction_id")]
        public string? TransactionId { get; set; }

        [Column("original_transaction_id")]
        public string? OriginalTransactionId { get; set; }

        [Column("event_type")]
        public string EventType { get; set; } = string.Empty;

        [Column("metadata")]
        public object? Metadata { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}