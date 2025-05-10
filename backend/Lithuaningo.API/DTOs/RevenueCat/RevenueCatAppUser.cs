using Newtonsoft.Json;

namespace Lithuaningo.API.DTOs.RevenueCat
{
    public class RevenueCatAppUser
    {
        [JsonProperty("id")]
        public string Id { get; set; } = string.Empty;
    }
}