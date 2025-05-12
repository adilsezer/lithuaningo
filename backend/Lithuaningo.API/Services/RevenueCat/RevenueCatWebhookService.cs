using Lithuaningo.API.DTOs.RevenueCat;
using Lithuaningo.API.Services.Subscription;
using Lithuaningo.API.Services.UserProfile;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;

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
            ILogger<RevenueCatWebhookService> logger,
            IOptions<RevenueCatSettings> revenueCatSettings)
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

            _logger.LogInformation("Processing RevenueCat webhook event");

            if (string.IsNullOrEmpty(evt.AppUserId))
            {
                _logger.LogWarning("AppUserID is missing in event.");
                return;
            }

            // Determine premium status directly from the event type according to RevenueCat documentation
            bool isPremium;
            bool shouldUpdateProfile = true;

            // Get uppercase event type for reliable comparison
            string eventType = evt.Type?.ToUpperInvariant() ?? string.Empty;

            // For standard subscriptions, determine from event type
            switch (eventType)
            {
                // Active subscription events - premium access should be granted
                case "INITIAL_PURCHASE":
                case "TRIAL":
                case "RENEWAL":
                case "NON_RENEWING_PURCHASE":
                case "UNCANCELLATION":
                case "SUBSCRIPTION_EXTENDED":
                case "PRODUCT_CHANGE":
                case "REFUND_REVERSED":
                case "TEMPORARY_ENTITLEMENT_GRANT":
                case "TRANSFER":
                    isPremium = true;
                    _logger.LogInformation("Active subscription event detected");
                    break;

                // Immediate revocation events
                case "EXPIRATION":
                    isPremium = false;
                    _logger.LogInformation("Subscription ended event detected");
                    break;

                // Special handling based on expiration date
                case "CANCELLATION":
                case "SUBSCRIPTION_PAUSED":
                case "BILLING_ISSUE":
                    // Check if subscription is still active based on expiration date
                    if (evt.ExpirationAtMs > 0)
                    {
                        var expirationDate = DateTimeOffset.FromUnixTimeMilliseconds(evt.ExpirationAtMs).UtcDateTime;

                        // Add buffer time to account for webhook delays 
                        isPremium = expirationDate > DateTime.UtcNow.Subtract(TimeSpan.FromMinutes(5));

                        _logger.LogInformation("Special event with future/past expiration detected");
                    }
                    else
                    {
                        // If no expiration date, assume not premium
                        isPremium = false;
                        _logger.LogInformation("Special event with no expiration date detected");
                    }
                    break;

                // For other events, don't update the profile
                default:
                    _logger.LogInformation("Unhandled event type. No profile update");
                    shouldUpdateProfile = false;
                    isPremium = false; // Default value, won't be used if shouldUpdateProfile is false
                    break;
            }

            if (shouldUpdateProfile)
            {
                try
                {
                    var subscription = await _subscriptionService.AddSubscriptionEventAsync(
                        evt.AppUserId,
                        evt,
                        isPremium);

                    _logger.LogInformation("Saved subscription record");

                    var updatedProfile = await _userProfileService.UpdatePremiumStatusFromWebhookAsync(
                        evt.AppUserId,
                        isPremium);

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