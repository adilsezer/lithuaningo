using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.RevenueCat;
using Lithuaningo.API.Models;

namespace Lithuaningo.API.Services.Subscription
{
    public interface ISubscriptionService
    {
        Task<Models.Subscription> AddSubscriptionEventAsync(string userId, RevenueCatEvent revenueCatEvent, bool isPremium, DateTime? expiresAt);
        Task<Models.Subscription?> GetLatestSubscriptionAsync(string userId);
        Task<List<Models.Subscription>> GetSubscriptionHistoryAsync(string userId);
    }
}