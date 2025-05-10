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

            _logger.LogInformation("[RevenueCatWebhookService] Processing EventID: {EventId}, EventType: {EventType}. (AppUserID available if needed for specific error context)",
                                 evt.Id, evt.Type);

            if (string.IsNullOrEmpty(evt.AppUserId))
            {
                _logger.LogWarning("[RevenueCatWebhookService] AppUserID is missing. EventID: {EventId}, EventType: {EventType}", evt.Id, evt.Type);
                return;
            }

            bool isPremium = false;
            DateTime? premiumExpiresAt = null;
            bool shouldUpdateProfile = true;

            switch (evt.Type?.ToUpperInvariant())
            {
                case "INITIAL_PURCHASE":
                case "RENEWAL":
                case "PRODUCT_CHANGE":
                case "UNCANCEL":
                    if (evt.Entitlements != null && evt.Entitlements.TryGetValue(PremiumEntitlementId, out var premiumEntitlement))
                    {
                        isPremium = true;
                        premiumExpiresAt = premiumEntitlement.ExpiresAtMs.HasValue
                            ? DateTimeOffset.FromUnixTimeMilliseconds(premiumEntitlement.ExpiresAtMs.Value).UtcDateTime
                            : null;
                    }
                    else
                    {
                        _logger.LogWarning("[RevenueCatWebhookService] EventID: {EventId}, EventType: {EventType} for AppUserID (hidden) did not contain expected premium entitlement '{EntitlementId}'. Assuming not premium.",
                                         evt.Id, evt.Type, PremiumEntitlementId);
                        isPremium = false;
                        premiumExpiresAt = null;
                    }
                    break;

                case "EXPIRATION":
                case "CANCELLATION":
                    isPremium = false;
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
                    _logger.LogInformation("[RevenueCatWebhookService] EventID: {EventId}, EventType: {EventType} for AppUserID (hidden). Setting isPremium to false. Expiry: {ExpiryDate}",
                                         evt.Id, evt.Type, premiumExpiresAt);
                    break;

                default:
                    _logger.LogInformation("[RevenueCatWebhookService] Unhandled EventID: {EventId}, EventType: {EventType} for AppUserID (hidden). No profile update.",
                                         evt.Id, evt.Type);
                    shouldUpdateProfile = false;
                    break;
            }

            if (shouldUpdateProfile)
            {
                try
                {
                    var updatedProfile = await _userProfileService.UpdatePremiumStatusFromWebhookAsync(evt.AppUserId, isPremium, premiumExpiresAt);
                    if (updatedProfile == null)
                    {
                        _logger.LogWarning("[RevenueCatWebhookService] UserProfileService.UpdatePremiumStatusFromWebhookAsync returned null for EventID: {EventId} (user not found or update failed for AppUserID (hidden)).",
                                         evt.Id);
                    }
                    else
                    {
                        _logger.LogInformation("[RevenueCatWebhookService] Successfully updated profile from EventID: {EventId}, EventType: {EventType}. New premium status: {IsPremium} for AppUserID (hidden).",
                                             evt.Id, evt.Type, updatedProfile.IsPremium);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[RevenueCatWebhookService] Error calling UserProfileService.UpdatePremiumStatusFromWebhookAsync for EventID: {EventId}. AppUserID was {AppUserId_ForErrorContextOnly_NotLoggedByDefault}",
                                     evt.Id, evt.AppUserId);
                    throw;
                }
            }
        }
    }
}