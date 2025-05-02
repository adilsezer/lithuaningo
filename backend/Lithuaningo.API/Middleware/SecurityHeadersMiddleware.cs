using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace Lithuaningo.API.Middleware;

public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IWebHostEnvironment _environment;

    public SecurityHeadersMiddleware(RequestDelegate next, IWebHostEnvironment environment)
    {
        _next = next;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;

        // Security Headers
        headers.Append("X-XSS-Protection", "1; mode=block");
        headers.Append("X-Content-Type-Options", "nosniff");
        headers.Append("X-Frame-Options", "DENY");
        headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

        // Add HSTS header in production (already enforced by ASP.NET middleware)
        if (!_environment.IsDevelopment())
        {
            headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
        }

        // Content Security Policy - Environment-specific
        var cspBuilder = new StringBuilder();
        cspBuilder.Append("default-src 'self'; ");
        cspBuilder.Append("img-src 'self' data: https://storage.lithuaningo.com; ");
        cspBuilder.Append("font-src 'self'; ");

        if (_environment.IsDevelopment())
        {
            // More permissive in development
            cspBuilder.Append("style-src 'self' 'unsafe-inline'; ");
            cspBuilder.Append("script-src 'self' 'unsafe-inline' 'unsafe-eval'; ");
        }
        else
        {
            // Stricter in production
            cspBuilder.Append("style-src 'self'; ");
            cspBuilder.Append("script-src 'self'; ");
        }

        cspBuilder.Append("connect-src 'self' https://api.lithuaningo.com https://xyltjnpggvctdbukzrjb.supabase.co; ");
        cspBuilder.Append("media-src 'self' https://storage.lithuaningo.com; ");
        cspBuilder.Append("object-src 'none'; ");
        cspBuilder.Append("frame-ancestors 'none'; ");
        cspBuilder.Append("base-uri 'self'; ");
        cspBuilder.Append("form-action 'self';");

        headers.Append("Content-Security-Policy", cspBuilder.ToString());

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