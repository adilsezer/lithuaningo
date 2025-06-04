using System.Net;
using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Lithuaningo.API.Middleware;

public class GlobalExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public GlobalExceptionHandlingMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddleware> logger, IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "An unhandled exception occurred");

        var response = context.Response;
        response.ContentType = "application/json";
        response.StatusCode = (int)GetStatusCode(exception);

        var errorResponse = new ProblemDetails
        {
            Status = (int)GetStatusCode(exception),
            Title = GetTitle(exception),
            Detail = GetSafeErrorMessage(exception),
            Instance = context.Request.Path
        };

        var result = JsonSerializer.Serialize(errorResponse);
        await response.WriteAsync(result);
    }

    private static HttpStatusCode GetStatusCode(Exception exception)
    {
        return exception switch
        {
            ValidationException => HttpStatusCode.BadRequest,
            KeyNotFoundException => HttpStatusCode.NotFound,
            UnauthorizedAccessException => HttpStatusCode.Unauthorized,
            _ => HttpStatusCode.InternalServerError
        };
    }

    private static string GetTitle(Exception exception)
    {
        return exception switch
        {
            ValidationException => "Validation Error",
            KeyNotFoundException => "Resource Not Found",
            UnauthorizedAccessException => "Unauthorized",
            _ => "Server Error"
        };
    }

    private string GetSafeErrorMessage(Exception exception)
    {
        // In development, show detailed error messages for debugging
        if (_environment.IsDevelopment())
        {
            return exception.Message;
        }

        // In production, return safe generic messages to prevent information disclosure
        return exception switch
        {
            ValidationException => exception.Message, // Validation errors are safe to expose
            KeyNotFoundException => "The requested resource was not found.",
            UnauthorizedAccessException => "Access denied.",
            _ => "An internal server error occurred. Please try again later."
        };
    }
}