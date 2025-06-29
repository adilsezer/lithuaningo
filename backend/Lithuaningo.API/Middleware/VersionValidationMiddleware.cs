using System.Text.Json;
using Lithuaningo.API.Services.AppInfo;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Lithuaningo.API.Middleware;

public class VersionValidationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<VersionValidationMiddleware> _logger;
    private readonly IServiceProvider _serviceProvider;

    public VersionValidationMiddleware(
        RequestDelegate next,
        ILogger<VersionValidationMiddleware> logger,
        IServiceProvider serviceProvider)
    {
        _next = next;
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip version validation for certain endpoints
        if (ShouldSkipValidation(context))
        {
            await _next(context);
            return;
        }

        // Extract version information from headers
        var clientVersion = GetClientVersion(context);
        var platform = GetPlatform(context);

        if (string.IsNullOrEmpty(clientVersion) || string.IsNullOrEmpty(platform))
        {
            _logger.LogWarning("Missing version or platform information in request from {IP}",
                context.Connection.RemoteIpAddress);
            await _next(context);
            return;
        }

        // Validate version using scoped service
        using var scope = _serviceProvider.CreateScope();
        var appInfoService = scope.ServiceProvider.GetRequiredService<IAppInfoService>();

        try
        {
            var appInfo = await appInfoService.GetAppInfoAsync(platform);
            if (appInfo != null && !string.IsNullOrEmpty(appInfo.MinimumVersion))
            {
                if (!IsVersionValid(clientVersion, appInfo.MinimumVersion))
                {
                    _logger.LogWarning(
                        "Client version {ClientVersion} is below minimum required version {MinVersion} for platform {Platform}",
                        clientVersion, appInfo.MinimumVersion, platform);

                    await HandleVersionTooOld(context, appInfo);
                    return;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating client version");
            // Continue with request if version validation fails
        }

        await _next(context);
    }

    private static bool ShouldSkipValidation(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant();

        // Skip validation for these endpoints
        var skipPaths = new[]
        {
            "/health",
            "/api/appinfo/health",
            "/api/v1/appinfo/health",
            "/api/appinfo/",
            "/api/v1/appinfo/",
            "/swagger",
            "/api/v1/webhooks/revenuecat"
        };

        return skipPaths.Any(skipPath => path?.StartsWith(skipPath) == true);
    }

    private static string? GetClientVersion(HttpContext context)
    {
        // Try multiple header sources for version
        var headers = context.Request.Headers;

        // Primary: X-App-Version header
        if (headers.TryGetValue("X-App-Version", out var versionHeader))
        {
            return versionHeader.FirstOrDefault();
        }

        // Secondary: Parse from User-Agent header (format: LithuaningoMobile/3.0.2)
        if (headers.TryGetValue("User-Agent", out var userAgent))
        {
            var userAgentStr = userAgent.FirstOrDefault();
            if (!string.IsNullOrEmpty(userAgentStr) && userAgentStr.Contains("LithuaningoMobile/"))
            {
                var parts = userAgentStr.Split('/');
                if (parts.Length > 1)
                {
                    return parts[1].Split(' ')[0]; // Get version part before any space
                }
            }
        }

        return null;
    }

    private static string? GetPlatform(HttpContext context)
    {
        var headers = context.Request.Headers;

        // Try X-Platform header first
        if (headers.TryGetValue("X-Platform", out var platformHeader))
        {
            return platformHeader.FirstOrDefault()?.ToLowerInvariant();
        }

        // Fallback: detect from User-Agent
        if (headers.TryGetValue("User-Agent", out var userAgent))
        {
            var userAgentStr = userAgent.FirstOrDefault()?.ToLowerInvariant();
            if (userAgentStr?.Contains("android") == true)
                return "android";
            if (userAgentStr?.Contains("ios") == true || userAgentStr?.Contains("iphone") == true)
                return "ios";
        }

        return "unknown";
    }

    private static bool IsVersionValid(string clientVersion, string minimumVersion)
    {
        try
        {
            var clientVer = new Version(clientVersion);
            var minVer = new Version(minimumVersion);
            return clientVer >= minVer;
        }
        catch (Exception)
        {
            // If version parsing fails, allow the request (fail safe)
            return true;
        }
    }

    private static async Task HandleVersionTooOld(HttpContext context, DTOs.AppInfo.AppInfoResponse appInfo)
    {
        context.Response.StatusCode = 426; // Upgrade Required
        context.Response.ContentType = "application/json";

        var response = new
        {
            error = "CLIENT_VERSION_TOO_OLD",
            message = "Your app version is no longer supported. Please update to the latest version.",
            currentVersion = appInfo.CurrentVersion,
            minimumVersion = appInfo.MinimumVersion,
            forceUpdate = appInfo.ForceUpdate,
            updateUrl = appInfo.UpdateUrl,
            maintenanceMessage = appInfo.MaintenanceMessage,
            timestamp = DateTime.UtcNow
        };

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}