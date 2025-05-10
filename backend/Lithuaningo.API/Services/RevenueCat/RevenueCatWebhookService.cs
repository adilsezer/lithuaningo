using System;
using System.Linq;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.RevenueCat;
using Lithuaningo.API.Services.UserProfile;
using Microsoft.Extensions.Logging;

namespace Lithuaningo.API.Services.RevenueCat
{
    public class RevenueCatWebhookService : IRevenueCatWebhookService
    {
        private readonly IUserProfileService _userProfileService;
        private readonly ILogger<RevenueCatWebhookService> _logger;
        // Ensure this matches your RevenueCat entitlement ID (ideally from config)
        private const string PremiumEntitlementId = "Premium";

        public RevenueCatWebhookService(
            IUserProfileService userProfileService,
            ILogger<RevenueCatWebhookService> logger)
        {
            _userProfileService = userProfileService ?? throw new ArgumentNullException(nameof(userProfileService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task ProcessWebhookEventAsync(RevenueCatEvent evt)
        {
            if (evt == null)
            {
                _logger.LogWarning("[RevenueCatWebhookService] Event object is null. Cannot process.");
                throw new ArgumentNullException(nameof(evt), "RevenueCat event cannot be null.");
            }

            _logger.LogInformation("[RevenueCatWebhookService] Processing event type: {EventType}, AppUserID: {AppUserId}", evt.Type, evt.AppUserId);

            if (string.IsNullOrEmpty(evt.AppUserId))
            {
                _logger.LogWarning("[RevenueCatWebhookService] AppUserId is missing in the event. Cannot update profile.");
                // Depending on how strict you want to be, you could throw an ArgumentException here.
                return; // Or throw, so controller returns a 400
            }

            bool isPremium = false;
            DateTime? premiumExpiresAt = null;
            bool shouldUpdateProfile = true; // Assume we should update unless it's an unhandled event

            switch (evt.Type?.ToUpperInvariant())
            {
                case "INITIAL_PURCHASE":
                case "RENEWAL":
                case "PRODUCT_CHANGE": // Handles upgrades, downgrades, crossgrades
                case "UNCANCEL":       // User re-enabled a subscription that was set to cancel
                    if (evt.Entitlements != null && evt.Entitlements.TryGetValue(PremiumEntitlementId, out var premiumEntitlement))
                    {
                        isPremium = true; // If the premium entitlement exists and is active (implied by being in active entitlements)
                        premiumExpiresAt = premiumEntitlement.ExpiresAtMs.HasValue
                            ? DateTimeOffset.FromUnixTimeMilliseconds(premiumEntitlement.ExpiresAtMs.Value).UtcDateTime
                            : null; // Lifetime or other non-expiring scenarios might have null

                        // Example: Enhance for specific lifetime product ID
                        // if (evt.ProductId != null && evt.ProductId.Contains("lifetime")) 
                        // {
                        //     premiumExpiresAt = DateTime.UtcNow.AddYears(100); 
                        // }
                    }
                    else
                    {
                        // This case (e.g. INITIAL_PURCHASE but no premium entitlement found) might indicate a configuration issue
                        // or a purchase for a non-premium product through the same webhook.
                        _logger.LogWarning("[RevenueCatWebhookService] Event type {EventType} for AppUserID {AppUserId} did not contain the expected premium entitlement '{PremiumEntitlementId}'. Assuming not premium from this event.", evt.Type, evt.AppUserId, PremiumEntitlementId);
                        isPremium = false;
                        premiumExpiresAt = null; // Or a past date if appropriate
                    }
                    break;

                case "EXPIRATION":
                case "CANCELLATION": // For CANCELLATION, entitlement might still be active until period end.
                                     // RevenueCat usually sends EXPIRATION when access truly ends.
                    isPremium = false; // Access is ending or has ended.
                    // We can try to get the expiration from the event if it helps with record keeping
                    if (evt.Entitlements != null && evt.Entitlements.TryGetValue(PremiumEntitlementId, out var expiredEntitlement))
                    {
                        premiumExpiresAt = expiredEntitlement.ExpiresAtMs.HasValue
                           ? DateTimeOffset.FromUnixTimeMilliseconds(expiredEntitlement.ExpiresAtMs.Value).UtcDateTime
                           : DateTimeOffset.FromUnixTimeMilliseconds(evt.EventTimestampMs).UtcDateTime;
                    }
                    else
                    {
                        premiumExpiresAt = DateTimeOffset.FromUnixTimeMilliseconds(evt.EventTimestampMs).UtcDateTime;
                    }
                    _logger.LogInformation("[RevenueCatWebhookService] Event {EventType} for AppUserID {AppUserId}. Setting isPremium to false. Expiry determined as: {ExpiryDate}", evt.Type, evt.AppUserId, premiumExpiresAt);
                    break;

                // Consider BILLING_ISSUE: User might lose access temporarily or enter grace period.
                // case "BILLING_ISSUE":
                //     _logger.LogInformation("[RevenueCatWebhookService] Billing issue for {AppUserId}. isPremium might remain true if in grace period, or false if access revoked.", evt.AppUserId);
                //     // Logic here depends on how RevenueCat structures grace period info in this event
                //     // and how you want to reflect it in your DB.
                //     shouldUpdateProfile = false; // Or handle explicitly
                //     break;

                default:
                    _logger.LogInformation("[RevenueCatWebhookService] Unhandled event type: {EventType} for AppUserID {AppUserId}. No profile update will occur from this event.", evt.Type, evt.AppUserId);
                    shouldUpdateProfile = false;
                    break;
            }

            if (shouldUpdateProfile)
            {
                _logger.LogInformation("[RevenueCatWebhookService] Attempting to update profile for AppUserID: {AppUserId}. IsPremium: {IsPremium}, ExpiresAt: {ExpiresAt}", evt.AppUserId, isPremium, premiumExpiresAt);
                try
                {
                    var updatedProfile = await _userProfileService.UpdatePremiumStatusFromWebhookAsync(evt.AppUserId, isPremium, premiumExpiresAt);
                    if (updatedProfile == null)
                    {
                        _logger.LogWarning("[RevenueCatWebhookService] UserProfileService.UpdatePremiumStatusFromWebhookAsync returned null (user not found or update failed) for AppUserID: {AppUserId}.", evt.AppUserId);
                        // This might be a normal case if an event comes for a user not yet in your DB, or an error.
                        // Depending on desired behavior, you might throw an exception for the controller to catch.
                    }
                    else
                    {
                        _logger.LogInformation("[RevenueCatWebhookService] Successfully processed and updated profile for event {EventType} for AppUserID: {AppUserId}. New premium status: {IsPremium}", evt.Type, evt.AppUserId, updatedProfile.IsPremium);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[RevenueCatWebhookService] Error calling UserProfileService.UpdatePremiumStatusFromWebhookAsync for AppUserID {AppUserId}.", evt.AppUserId);
                    throw; // Re-throw to allow controller to handle HTTP response (e.g., 500 error)
                }
            }
        }
    }
}