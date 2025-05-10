using Newtonsoft.Json;

namespace Lithuaningo.API.DTOs.RevenueCat
{
    public class RevenueCatWebhookPayload
    {
        [JsonProperty("api_version")]
        public string ApiVersion { get; set; } = string.Empty;

        [JsonProperty("event")]
        public RevenueCatEvent? Event { get; set; }
    }
}