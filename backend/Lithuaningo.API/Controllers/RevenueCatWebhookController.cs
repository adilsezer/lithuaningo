using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Lithuaningo.API.DTOs.RevenueCat;
using Lithuaningo.API.Services.RevenueCat;
using Lithuaningo.API.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace Lithuaningo.API.Controllers
{
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/webhooks")]
    [ApiController]
    public class RevenueCatWebhookController : ControllerBase
    {
        private readonly ILogger<RevenueCatWebhookController> _logger;
        private readonly IRevenueCatWebhookService _revenueCatWebhookService;
        private readonly string _expectedAuthHeaderValue;

        public RevenueCatWebhookController(
            ILogger<RevenueCatWebhookController> logger,
            IRevenueCatWebhookService revenueCatWebhookService,
            IOptions<RevenueCatSettings> revenueCatSettings,
            IConfiguration configuration)
        {
            _logger = logger;
            _revenueCatWebhookService = revenueCatWebhookService ?? throw new ArgumentNullException(nameof(revenueCatWebhookService));

            // First try to get from settings, then fallback to configuration or environment variables
            _expectedAuthHeaderValue = revenueCatSettings.Value.WebhookAuthHeader;

            if (string.IsNullOrEmpty(_expectedAuthHeaderValue))
            {
                _expectedAuthHeaderValue = configuration["RevenueCat:WebhookAuthHeader"] ??
                                          configuration["REVENUECAT_WEBHOOK_AUTH_HEADER"] ??
                                          throw new InvalidOperationException("RevenueCat Webhook Authorization Header value not configured.");
            }

            if (string.IsNullOrEmpty(_expectedAuthHeaderValue))
            {
                _logger.LogCritical("REVENUECAT WEBHOOK AUTHORIZATION HEADER IS NOT CONFIGURED. Webhooks will fail.");
                throw new InvalidOperationException("RevenueCat Webhook Authorization Header value is missing. Cannot process webhooks securely.");
            }
        }

        [HttpPost("revenuecat")]
        [AllowAnonymous]
        public async Task<IActionResult> HandleRevenueCatWebhook()
        {
            _logger.LogInformation("RevenueCat webhook received. Verifying authorization...");

            if (!Request.Headers.TryGetValue("Authorization", out var authorizationHeaderValues))
            {
                _logger.LogWarning("RevenueCat webhook 'Authorization' header is missing.");
                return Unauthorized("Authorization header is missing.");
            }

            string receivedAuthHeader = authorizationHeaderValues.ToString();

            if (!string.Equals(receivedAuthHeader, _expectedAuthHeaderValue, StringComparison.Ordinal))
            {
                _logger.LogWarning("Invalid RevenueCat webhook Authorization header.");
                return Unauthorized("Invalid Authorization header.");
            }

            Request.EnableBuffering();
            string requestBody;
            using (var reader = new StreamReader(Request.Body, encoding: Encoding.UTF8, detectEncodingFromByteOrderMarks: false, leaveOpen: true))
            {
                requestBody = await reader.ReadToEndAsync();
                Request.Body.Position = 0;
            }

            if (string.IsNullOrEmpty(requestBody))
            {
                _logger.LogWarning("RevenueCat webhook request body is empty.");
                return BadRequest("Request body is empty.");
            }

            RevenueCatWebhookPayload? payload;
            try
            {
                payload = JsonConvert.DeserializeObject<RevenueCatWebhookPayload>(requestBody);
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to deserialize RevenueCat webhook payload.");
                return BadRequest("Invalid JSON payload.");
            }

            if (payload?.Event == null)
            {
                _logger.LogWarning("RevenueCat webhook event data is missing after deserialization.");
                return BadRequest("Event data is missing after deserialization.");
            }

            _logger.LogInformation("Deserialized RevenueCat Event.");

            try
            {
                await _revenueCatWebhookService.ProcessWebhookEventAsync(payload.Event);
                _logger.LogInformation("Successfully processed event via service.");
                return Ok("Webhook processed successfully.");
            }
            catch (ArgumentNullException ex)
            {
                _logger.LogWarning(ex, "Argument null exception while processing webhook event.");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing RevenueCat webhook event via service.");
                return StatusCode(500, "Internal server error while processing webhook event.");
            }
        }
    }
}