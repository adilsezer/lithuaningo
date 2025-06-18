using System.Text;
using System.Threading.Tasks;
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
        // Remove server information headers
        context.Response.Headers.Remove("Server");
        context.Response.Headers.Remove("X-Powered-By");

        // Add security headers
        var headers = context.Response.Headers;

        // Prevent MIME type sniffing
        if (!headers.ContainsKey("X-Content-Type-Options"))
        {
            headers["X-Content-Type-Options"] = "nosniff";
        }

        // Prevent clickjacking
        if (!headers.ContainsKey("X-Frame-Options"))
        {
            headers["X-Frame-Options"] = "DENY";
        }

        // Enable XSS protection
        if (!headers.ContainsKey("X-XSS-Protection"))
        {
            headers["X-XSS-Protection"] = "1; mode=block";
        }

        // Referrer policy
        if (!headers.ContainsKey("Referrer-Policy"))
        {
            headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        }

        // Permissions policy (Feature Policy)
        if (!headers.ContainsKey("Permissions-Policy"))
        {
            headers["Permissions-Policy"] =
                "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()";
        }

        // Content Security Policy
        if (!headers.ContainsKey("Content-Security-Policy"))
        {
            var csp = BuildContentSecurityPolicy();
            headers["Content-Security-Policy"] = csp;
        }

        // HSTS (only in production)
        if (!_environment.IsDevelopment() && !headers.ContainsKey("Strict-Transport-Security"))
        {
            headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
        }

        // Cross-Origin policies for API
        if (!headers.ContainsKey("Cross-Origin-Embedder-Policy"))
        {
            headers["Cross-Origin-Embedder-Policy"] = "require-corp";
        }

        if (!headers.ContainsKey("Cross-Origin-Opener-Policy"))
        {
            headers["Cross-Origin-Opener-Policy"] = "same-origin";
        }

        if (!headers.ContainsKey("Cross-Origin-Resource-Policy"))
        {
            headers["Cross-Origin-Resource-Policy"] = "cross-origin";
        }

        await _next(context);
    }

    private string BuildContentSecurityPolicy()
    {
        var csp = new List<string>
        {
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'", // unsafe-inline needed for Swagger UI
            "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Swagger UI
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://*.supabase.co https://api.openai.com",
            "media-src 'self' https:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests"
        };

        // More relaxed CSP for development
        if (_environment.IsDevelopment())
        {
            csp = new List<string>
            {
                "default-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https: http:",
                "font-src 'self' data:",
                "connect-src 'self' https: http: ws: wss:",
                "media-src 'self' https: http:",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'"
            };
        }

        return string.Join("; ", csp);
    }
}