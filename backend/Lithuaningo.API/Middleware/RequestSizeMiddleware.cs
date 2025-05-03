using System.Net;
using Microsoft.AspNetCore.Http;

namespace Lithuaningo.API.Middleware;

public class RequestSizeMiddleware
{
    private readonly RequestDelegate _next;
    private const int MaxRequestBodySize = 10 * 1024 * 1024; // 10MB

    public RequestSizeMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var request = context.Request;

        if (request.ContentLength > MaxRequestBodySize)
        {
            context.Response.StatusCode = (int)HttpStatusCode.RequestEntityTooLarge;
            await context.Response.WriteAsJsonAsync(new { message = "Request body too large." });
            return;
        }

        if (request.Headers.ContentLength == null && request.Method != HttpMethod.Get.Method)
        {
            context.Response.StatusCode = (int)HttpStatusCode.LengthRequired;
            await context.Response.WriteAsJsonAsync(new { message = "Content-Length header is required." });
            return;
        }

        await _next(context);
    }
} 