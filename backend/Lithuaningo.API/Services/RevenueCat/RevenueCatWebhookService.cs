using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.RevenueCat;
using Lithuaningo.API.Services.Subscription;
using Lithuaningo.API.Services.UserProfile;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Lithuaningo.API.Services.RevenueCat
{
    public class RevenueCatWebhookService : IRevenueCatWebhookService
    {
        private readonly IUserProfileService _userProfileService;
        private readonly ISubscriptionService _subscriptionService;
        private readonly ILogger<RevenueCatWebhookService> _logger;
        private readonly RevenueCatSettings _revenueCatSettings;

        public RevenueCatWebhookService(
            IUserProfileService userProfileService,
            ISubscriptionService subscriptionService,
            ILogger<RevenueCatWebhookService> logger,
            IOptions<RevenueCatSettings> revenueCatSettings)
        {
            _userProfileService = userProfileService ?? throw new ArgumentNullException(nameof(userProfileService));
            _subscriptionService = subscriptionService ?? throw new ArgumentNullException(nameof(subscriptionService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _revenueCatSettings = revenueCatSettings?.Value ?? throw new ArgumentNullException(nameof(revenueCatSettings));
        }

        private bool IsPurchaseOrActivationEventType(string? eventType)
        {
            if (string.IsNullOrEmpty(eventType)) return false;
            return eventType.ToUpperInvariant() switch
            {
                "TEST" => true,
                "INITIAL_PURCHASE" => true,
                "RENEWAL" => true,
                "PRODUCT_CHANGE" => true,
                "UNCANCEL" => true,
                _ => false,
            };
        }

        public async Task ProcessWebhookEventAsync(RevenueCatEvent evt)
        {
            if (evt == null)
            {
                _logger.LogWarning("Event object is null. Cannot process.");
                throw new ArgumentNullException(nameof(evt), "RevenueCat event cannot be null.");
            }

            _logger.LogInformation("Processing RevenueCat event");

            if (string.IsNullOrEmpty(evt.AppUserId))
            {
                _logger.LogWarning("AppUserID is missing in event.");
                return;
            }

            bool isPremium = false;
            DateTime? premiumExpiresAt = null;
            bool shouldUpdateProfile = true;

            List<string> lifetimeProductIds = _revenueCatSettings.LifetimeProductIdentifiers ?? new List<string>();

            switch (evt.Type?.ToUpperInvariant())
            {
                case "TEST":
                case "INITIAL_PURCHASE":
                case "RENEWAL":
                case "PRODUCT_CHANGE":
                case "UNCANCEL":
                    if (!string.IsNullOrEmpty(evt.ProductId) && lifetimeProductIds.Contains(evt.ProductId) && IsPurchaseOrActivationEventType(evt.Type))
                    {
                        isPremium = true;
                        premiumExpiresAt = DateTime.UtcNow.AddYears(100);
                        _logger.LogInformation("Identified lifetime product event");
                    }
                    else if (evt.ExpirationAtMs > 0)
                    {
                        var expirationDate = DateTimeOffset.FromUnixTimeMilliseconds(evt.ExpirationAtMs).UtcDateTime;
                        if (expirationDate > DateTime.UtcNow)
                        {
                            isPremium = true;
                            premiumExpiresAt = expirationDate;
                            _logger.LogInformation("Processing subscription event with future expiration");
                        }
                        else
                        {
                            isPremium = false;
                            premiumExpiresAt = expirationDate;
                            _logger.LogInformation("Processing subscription event with past expiration");
                        }
                    }
                    else
                    {
                        isPremium = false;
                        if (evt.EventTimestampMs > 0)
                        {
                            premiumExpiresAt = DateTimeOffset.FromUnixTimeMilliseconds(evt.EventTimestampMs).UtcDateTime;
                        }
                        else
                        {
                            premiumExpiresAt = null;
                        }
                        _logger.LogInformation("Processing event with no positive ExpirationAtMs and not lifetime");
                    }
                    break;

                case "EXPIRATION":
                case "CANCELLATION":
                    isPremium = false;
                    if (evt.ExpirationAtMs > 0)
                    {
                        premiumExpiresAt = DateTimeOffset.FromUnixTimeMilliseconds(evt.ExpirationAtMs).UtcDateTime;
                    }
                    else
                    {
                        premiumExpiresAt = DateTimeOffset.FromUnixTimeMilliseconds(evt.EventTimestampMs).UtcDateTime;
                    }
                    _logger.LogInformation("Processing subscription expiration or cancellation event");
                    break;

                default:
                    _logger.LogInformation("Unhandled event type. No profile update");
                    shouldUpdateProfile = false;
                    break;
            }

            if (shouldUpdateProfile)
            {
                try
                {
                    var subscription = await _subscriptionService.AddSubscriptionEventAsync(
                        evt.AppUserId,
                        evt,
                        isPremium,
                        premiumExpiresAt);

                    _logger.LogInformation("Saved subscription record");

                    var updatedProfile = await _userProfileService.UpdatePremiumStatusFromWebhookAsync(
                        evt.AppUserId,
                        isPremium,
                        premiumExpiresAt);

                    if (updatedProfile == null)
                    {
                        _logger.LogWarning("User profile update failed");
                    }
                    else
                    {
                        _logger.LogInformation("Successfully updated user profile");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing subscription event");
                    throw; // Re-throw to let the controller handle the HTTP response
                }
            }
        }
    }
}