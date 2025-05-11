using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.RevenueCat;
using Lithuaningo.API.Models;
using Lithuaningo.API.Services.Supabase;
using Microsoft.Extensions.Logging;
using Supabase;
using static Supabase.Postgrest.Constants;

namespace Lithuaningo.API.Services.Subscription
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly Client _supabaseClient;
        private readonly ILogger<SubscriptionService> _logger;

        public SubscriptionService(
            ISupabaseService supabaseService,
            ILogger<SubscriptionService> logger)
        {
            _supabaseClient = supabaseService.Client ?? throw new ArgumentNullException(nameof(supabaseService.Client));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Models.Subscription> AddSubscriptionEventAsync(string userId, RevenueCatEvent evt, bool isPremium, DateTime? expiresAt)
        {
            _logger.LogInformation("[SubscriptionService] Adding subscription event for user {UserId}", userId);

            try
            {
                // Map event type to subscription status
                string subscriptionStatus = evt.Type?.ToUpperInvariant() switch
                {
                    "INITIAL_PURCHASE" => "ACTIVE",
                    "RENEWAL" => "ACTIVE",
                    "PRODUCT_CHANGE" => "ACTIVE",
                    "UNCANCEL" => "ACTIVE",
                    "TEST" when isPremium => "ACTIVE",
                    "EXPIRATION" => "EXPIRED",
                    "CANCELLATION" => "CANCELLED",
                    _ => "UNKNOWN"
                };

                // Create metadata object
                var metadata = new
                {
                    evt.Environment,
                    evt.AppId,
                    evt.CountryCode,
                    evt.PeriodType,
                    evt.EntitlementId,
                    evt.EntitlementIds,
                    Aliases = evt.Aliases,
                    SubscriberAttributes = evt.SubscriberAttributes
                };

                // Create subscription record
                var subscription = new Models.Subscription
                {
                    Id = Guid.NewGuid(),
                    UserId = Guid.Parse(userId),
                    IsPremium = isPremium,
                    SubscriptionStatus = subscriptionStatus,
                    ProductId = evt.ProductId,
                    Store = evt.Store,
                    StartedAt = evt.PurchasedAtMs > 0
                        ? DateTimeOffset.FromUnixTimeMilliseconds(evt.PurchasedAtMs).UtcDateTime
                        : DateTimeOffset.FromUnixTimeMilliseconds(evt.EventTimestampMs).UtcDateTime,
                    ExpiresAt = expiresAt,
                    TransactionId = evt.TransactionId,
                    OriginalTransactionId = evt.OriginalTransactionId,
                    EventType = evt.Type ?? "UNKNOWN",
                    Metadata = metadata
                };

                var response = await _supabaseClient
                    .From<Models.Subscription>()
                    .Insert(subscription);

                var createdSubscription = response.Models.Count > 0 ? response.Models[0] : subscription;
                _logger.LogInformation("[SubscriptionService] Successfully added subscription event: {eventId}", createdSubscription.Id);

                return createdSubscription;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SubscriptionService] Error adding subscription event for user {UserId}", userId);
                throw;
            }
        }

        public async Task<Models.Subscription?> GetLatestSubscriptionAsync(string userId)
        {
            try
            {
                var response = await _supabaseClient
                    .From<Models.Subscription>()
                    .Where(s => s.UserId == Guid.Parse(userId))
                    .Order("created_at", Ordering.Descending)
                    .Limit(1)
                    .Get();

                return response.Models.Count > 0 ? response.Models[0] : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SubscriptionService] Error fetching latest subscription for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<Models.Subscription>> GetSubscriptionHistoryAsync(string userId)
        {
            try
            {
                var response = await _supabaseClient
                    .From<Models.Subscription>()
                    .Where(s => s.UserId == Guid.Parse(userId))
                    .Order("created_at", Ordering.Descending)
                    .Get();

                return response.Models;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SubscriptionService] Error fetching subscription history for user {UserId}", userId);
                throw;
            }
        }
    }
}