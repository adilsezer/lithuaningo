using System.Threading.Tasks;
using Lithuaningo.API.DTOs.RevenueCat;

namespace Lithuaningo.API.Services.RevenueCat
{
    public interface IRevenueCatWebhookService
    {
        /// <summary>
        /// Processes a deserialized RevenueCat webhook event.
        /// </summary>
        /// <param name="revenueCatEvent">The event object from RevenueCat's webhook payload.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task ProcessWebhookEventAsync(RevenueCatEvent revenueCatEvent);
    }
}