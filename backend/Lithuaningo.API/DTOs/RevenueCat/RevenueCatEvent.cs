using System.Collections.Generic;
using Newtonsoft.Json;

namespace Lithuaningo.API.DTOs.RevenueCat
{
    public class RevenueCatEntitlementInfo
    {
        [JsonProperty("expires_at_ms")]
        public long? ExpiresAtMs { get; set; }

        // Add other relevant properties from entitlement info if needed
        // e.g., product_identifier, is_active etc.
    }

    public class RevenueCatEvent
    {
        [JsonProperty("id")]
        public string Id { get; set; } = string.Empty;

        [JsonProperty("type")]
        public string Type { get; set; } = string.Empty;

        [JsonProperty("app_user_id")]
        public string AppUserId { get; set; } = string.Empty;

        [JsonProperty("entitlements")]
        public Dictionary<string, RevenueCatEntitlementInfo>? Entitlements { get; set; }

        // For EXPIRATION events, you might get entitlement IDs directly
        [JsonProperty("entitlement_ids")]
        public List<string>? EntitlementIds { get; set; }

        // If you need to check against a specific product for lifetime, etc.
        [JsonProperty("product_id")]
        public string? ProductId { get; set; }

        // Timestamp of the event
        [JsonProperty("event_timestamp_ms")]
        public long EventTimestampMs { get; set; }

        // You can add more properties as needed based on the event type
        // For example, for grace period handling:
        // [JsonProperty("grace_period_expires_at_ms")]
        // public long? GracePeriodExpiresAtMs { get; set; }
    }
}