using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Lithuaningo.API.Settings
{
    public class RevenueCatSettings
    {
        public const string SectionName = "RevenueCat";

        /// <summary>
        /// The authorization header value for RevenueCat webhook verification
        /// </summary>
        [Required]
        public string WebhookAuthHeader { get; set; } = string.Empty;
    }
}