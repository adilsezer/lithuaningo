using System;
using System.Collections.Generic;
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

        [Column("currency")]
        public string? Currency { get; set; }

        [Column("price")]
        public decimal? Price { get; set; }

        [Column("period_type")]
        public string? PeriodType { get; set; }

        [Column("country_code")]
        public string? CountryCode { get; set; }

        [Column("entitlement_id")]
        public string? EntitlementId { get; set; }

        [Column("presented_offering_id")]
        public string? PresentedOfferingId { get; set; }

        [Column("renewal_number")]
        public int? RenewalNumber { get; set; }

        [Column("metadata")]
        public object? Metadata { get; set; }
    }
}