using System;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.RevenueCat;
using Lithuaningo.API.Services.Subscription;
using Lithuaningo.API.Services.UserProfile;
using Microsoft.Extensions.Logging;

namespace Lithuaningo.API.Services.RevenueCat
{
    public class RevenueCatWebhookService : IRevenueCatWebhookService
    {
        private readonly IUserProfileService _userProfileService;
        private readonly ISubscriptionService _subscriptionService;
        private readonly ILogger<RevenueCatWebhookService> _logger;

        public RevenueCatWebhookService(
            IUserProfileService userProfileService,
            ISubscriptionService subscriptionService,
            ILogger<RevenueCatWebhookService> logger)
        {
            _userProfileService = userProfileService ?? throw new ArgumentNullException(nameof(userProfileService));
            _subscriptionService = subscriptionService ?? throw new ArgumentNullException(nameof(subscriptionService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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

            switch (evt.Type?.ToUpperInvariant())
            {
                case "TEST":
                    // For test events, check for product_id and valid expiration_at_ms
                    if (!string.IsNullOrEmpty(evt.ProductId) && evt.ExpirationAtMs > 0)
                    {
                        // Only set premium to true if we have a valid expiration date in the future
                        var expirationDate = DateTimeOffset.FromUnixTimeMilliseconds(evt.ExpirationAtMs).UtcDateTime;

                        if (expirationDate > DateTime.UtcNow)
                        {
                            isPremium = true;
                            premiumExpiresAt = expirationDate;
                            _logger.LogInformation("Processing TEST event with valid expiration");
                        }
                        else
                        {
                            isPremium = false;
                            premiumExpiresAt = expirationDate;
                            _logger.LogInformation("Processing TEST event with expired date");
                        }
                    }
                    else
                    {
                        isPremium = false;
                        _logger.LogInformation("Processing TEST event without valid expiration");
                    }
                    break;

                case "INITIAL_PURCHASE":
                case "RENEWAL":
                case "PRODUCT_CHANGE":
                case "UNCANCEL":
                    // Only set premium true if we have a valid expiration date in the future
                    if (evt.ExpirationAtMs > 0)
                    {
                        var expirationDate = DateTimeOffset.FromUnixTimeMilliseconds(evt.ExpirationAtMs).UtcDateTime;

                        if (expirationDate > DateTime.UtcNow)
                        {
                            isPremium = true;
                            premiumExpiresAt = expirationDate;
                            _logger.LogInformation("Processing purchase event with valid expiration");
                        }
                        else
                        {
                            isPremium = false;
                            premiumExpiresAt = expirationDate;
                            _logger.LogInformation("Processing purchase event with expired date");
                        }
                    }
                    else
                    {
                        isPremium = false;
                        _logger.LogInformation("Processing purchase event without valid expiration");
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
                    // First, save the full event details to the subscriptions table
                    var subscription = await _subscriptionService.AddSubscriptionEventAsync(
                        evt.AppUserId,
                        evt,
                        isPremium,
                        premiumExpiresAt);

                    _logger.LogInformation("Saved subscription record");

                    // Then, update the user profile with the premium status
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
                    throw;
                }
            }
        }
    }
}