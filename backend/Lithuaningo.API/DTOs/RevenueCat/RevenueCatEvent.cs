using System.Collections.Generic;
using Newtonsoft.Json;

namespace Lithuaningo.API.DTOs.RevenueCat
{
    public class SubscriberAttribute
    {
        [JsonProperty("updated_at_ms")]
        public long UpdatedAtMs { get; set; }

        [JsonProperty("value")]
        public string Value { get; set; } = string.Empty;
    }

    public class RevenueCatEvent
    {
        [JsonProperty("id")]
        public string Id { get; set; } = string.Empty;

        [JsonProperty("type")]
        public string Type { get; set; } = string.Empty;

        [JsonProperty("app_user_id")]
        public string AppUserId { get; set; } = string.Empty;

        [JsonProperty("aliases")]
        public List<string>? Aliases { get; set; }

        [JsonProperty("app_id")]
        public string? AppId { get; set; }

        [JsonProperty("commission_percentage")]
        public decimal? CommissionPercentage { get; set; }

        [JsonProperty("country_code")]
        public string? CountryCode { get; set; }

        [JsonProperty("currency")]
        public string? Currency { get; set; }

        [JsonProperty("entitlement_id")]
        public string? EntitlementId { get; set; }

        [JsonProperty("entitlement_ids")]
        public List<string>? EntitlementIds { get; set; }

        [JsonProperty("environment")]
        public string? Environment { get; set; }

        [JsonProperty("event_timestamp_ms")]
        public long EventTimestampMs { get; set; }

        [JsonProperty("expiration_at_ms")]
        public long ExpirationAtMs { get; set; }

        [JsonProperty("is_family_share")]
        public bool? IsFamilyShare { get; set; }

        [JsonProperty("metadata")]
        public object? Metadata { get; set; }

        [JsonProperty("offer_code")]
        public string? OfferCode { get; set; }

        [JsonProperty("original_app_user_id")]
        public string? OriginalAppUserId { get; set; }

        [JsonProperty("original_transaction_id")]
        public string? OriginalTransactionId { get; set; }

        [JsonProperty("period_type")]
        public string? PeriodType { get; set; }

        [JsonProperty("presented_offering_id")]
        public string? PresentedOfferingId { get; set; }

        [JsonProperty("price")]
        public decimal? Price { get; set; }

        [JsonProperty("price_in_purchased_currency")]
        public decimal? PriceInPurchasedCurrency { get; set; }

        [JsonProperty("product_id")]
        public string? ProductId { get; set; }

        [JsonProperty("purchased_at_ms")]
        public long PurchasedAtMs { get; set; }

        [JsonProperty("renewal_number")]
        public int? RenewalNumber { get; set; }

        [JsonProperty("store")]
        public string? Store { get; set; }

        [JsonProperty("subscriber_attributes")]
        public Dictionary<string, SubscriberAttribute>? SubscriberAttributes { get; set; }

        [JsonProperty("takehome_percentage")]
        public decimal? TakehomePercentage { get; set; }

        [JsonProperty("tax_percentage")]
        public decimal? TaxPercentage { get; set; }

        [JsonProperty("transaction_id")]
        public string? TransactionId { get; set; }
    }
}