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
                _logger.LogWarning("[RevenueCatWebhookService] Event object is null. Cannot process.");
                throw new ArgumentNullException(nameof(evt), "RevenueCat event cannot be null.");
            }

            _logger.LogInformation("[RevenueCatWebhookService] Processing RevenueCat event type: {0}", evt.Type);

            if (string.IsNullOrEmpty(evt.AppUserId))
            {
                _logger.LogWarning("[RevenueCatWebhookService] AppUserID is missing in event.");
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
                            _logger.LogInformation("[RevenueCatWebhookService] TEST event with product_id: {0}, setting isPremium to true with expiration at {1}.",
                                evt.ProductId, premiumExpiresAt);
                        }
                        else
                        {
                            isPremium = false;
                            premiumExpiresAt = expirationDate;
                            _logger.LogInformation("[RevenueCatWebhookService] TEST event has expired at {0}, setting isPremium to false.",
                                expirationDate);
                        }
                    }
                    else
                    {
                        isPremium = false;
                        _logger.LogInformation("[RevenueCatWebhookService] TEST event without valid product_id or expiration, setting isPremium to false.");
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
                            _logger.LogInformation("[RevenueCatWebhookService] Purchase event with valid expiration, setting isPremium to true.");
                        }
                        else
                        {
                            isPremium = false;
                            premiumExpiresAt = expirationDate;
                            _logger.LogInformation("[RevenueCatWebhookService] Purchase event with expired date, setting isPremium to false.");
                        }
                    }
                    else
                    {
                        isPremium = false;
                        _logger.LogInformation("[RevenueCatWebhookService] Purchase event without valid expiration, setting isPremium to false.");
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

                    _logger.LogInformation("[RevenueCatWebhookService] Subscription expiration or cancellation event. Setting isPremium to false.");
                    break;

                default:
                    _logger.LogInformation("[RevenueCatWebhookService] Unhandled event type: {0}. No profile update.", evt.Type);
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

                    _logger.LogInformation("[RevenueCatWebhookService] Saved subscription record with ID: {0}", subscription.Id);

                    // Then, update the user profile with the premium status
                    var updatedProfile = await _userProfileService.UpdatePremiumStatusFromWebhookAsync(
                        evt.AppUserId,
                        isPremium,
                        premiumExpiresAt);

                    if (updatedProfile == null)
                    {
                        _logger.LogWarning("[RevenueCatWebhookService] UserProfileService update returned null (user not found or update failed).");
                    }
                    else
                    {
                        _logger.LogInformation("[RevenueCatWebhookService] Successfully updated user profile for {0}. Premium: {1}, Expires: {2}",
                            evt.AppUserId, isPremium, premiumExpiresAt?.ToString() ?? "never");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[RevenueCatWebhookService] Error processing subscription event for user {UserId}", evt.AppUserId);
                    throw;
                }
            }
        }
    }
}