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

        public async Task<Models.Subscription> AddSubscriptionEventAsync(string userId, RevenueCatEvent evt, bool isPremium)
        {
            _logger.LogInformation("Adding subscription event");

            try
            {
                // Create metadata object with fields that aren't direct columns
                var metadata = new
                {
                    evt.Environment,
                    evt.AppId,
                    evt.IsFamilyShare,
                    evt.Aliases,
                    evt.OriginalAppUserId,
                    evt.PriceInPurchasedCurrency,
                    evt.TakehomePercentage,
                    evt.OfferCode,
                    evt.TaxPercentage,
                    evt.CommissionPercentage,
                    evt.EntitlementIds,
                    SubscriberAttributes = evt.SubscriberAttributes,
                    MetadataFromEvent = evt.Metadata
                };

                // Create subscription record
                var subscription = new Models.Subscription
                {
                    Id = Guid.NewGuid(),
                    UserId = Guid.Parse(userId),
                    IsPremium = isPremium,
                    ProductId = evt.ProductId,
                    Store = evt.Store,
                    StartedAt = evt.PurchasedAtMs > 0
                        ? DateTimeOffset.FromUnixTimeMilliseconds(evt.PurchasedAtMs).UtcDateTime
                        : DateTimeOffset.FromUnixTimeMilliseconds(evt.EventTimestampMs).UtcDateTime,
                    ExpiresAt = evt.ExpirationAtMs > 0
                        ? DateTimeOffset.FromUnixTimeMilliseconds(evt.ExpirationAtMs).UtcDateTime
                        : null,
                    TransactionId = evt.TransactionId,
                    OriginalTransactionId = evt.OriginalTransactionId,
                    EventType = evt.Type ?? "UNKNOWN",
                    // Set the new direct columns
                    Currency = evt.Currency,
                    Price = evt.Price,
                    PeriodType = evt.PeriodType,
                    CountryCode = evt.CountryCode,
                    EntitlementId = evt.EntitlementId,
                    PresentedOfferingId = evt.PresentedOfferingId,
                    RenewalNumber = evt.RenewalNumber,
                    Metadata = metadata
                };

                var response = await _supabaseClient
                    .From<Models.Subscription>()
                    .Insert(subscription);

                var createdSubscription = response.Models.Count > 0 ? response.Models[0] : subscription;
                _logger.LogInformation("Successfully added subscription event");

                return createdSubscription;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding subscription event");
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
                _logger.LogError(ex, "Error fetching latest subscription");
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
                _logger.LogError(ex, "Error fetching subscription history");
                throw;
            }
        }
    }
}