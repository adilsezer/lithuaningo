using Microsoft.AspNetCore.Http;

namespace Lithuaningo.API.Middleware;

public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;
        
        // Security Headers
        headers.Append("X-XSS-Protection", "1; mode=block");
        headers.Append("X-Content-Type-Options", "nosniff");
        headers.Append("X-Frame-Options", "DENY");
        headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
        
        // Content Security Policy
        headers.Append("Content-Security-Policy", 
            "default-src 'self'; " +
            "img-src 'self' data: https:; " +
            "font-src 'self'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "connect-src 'self' https:; " +
            "media-src 'self' https:; " +
            "object-src 'none'; " +
            "frame-ancestors 'none'; " +
            "base-uri 'self'; " +
            "form-action 'self';");

        // Permissions Policy
        headers.Append("Permissions-Policy", 
            "accelerometer=(), " +
            "camera=(), " +
            "geolocation=(), " +
            "gyroscope=(), " +
            "magnetometer=(), " +
            "microphone=(), " +
            "payment=(), " +
            "usb=()");

        await _next(context);
    }
} 