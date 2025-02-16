using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Lithuaningo.API.Services.Auth;
using System.IdentityModel.Tokens.Jwt;

namespace Lithuaningo.API.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AuthorizeAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // Check for AllowAnonymous attribute
        var allowAnonymous = context.ActionDescriptor.EndpointMetadata
            .OfType<AllowAnonymousAttribute>()
            .Any();

        if (allowAnonymous)
            return;

        var authService = context.HttpContext.RequestServices
            .GetRequiredService<IAuthService>();

        // Check for Authorization header
        var authHeader = context.HttpContext.Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader))
        {
            context.Result = new UnauthorizedObjectResult(new
            {
                message = "No authorization header present",
                code = "missing_header"
            });
            return;
        }

        // Validate Bearer token format
        if (!authHeader.StartsWith("Bearer "))
        {
            context.Result = new UnauthorizedObjectResult(new
            {
                message = "Invalid authorization header format. Must be 'Bearer {token}'",
                code = "invalid_header_format"
            });
            return;
        }

        var token = authHeader.Substring("Bearer ".Length);

        try
        {
            // Attempt to parse the token first
            var handler = new JwtSecurityTokenHandler();
            if (!handler.CanReadToken(token))
            {
                context.Result = new UnauthorizedObjectResult(new
                {
                    message = "Invalid JWT token format",
                    code = "invalid_token_format"
                });
                return;
            }

            // Validate the token
            if (!authService.ValidateToken(token))
            {
                try
                {
                    var principal = authService.GetClaimsPrincipalFromToken(token);
                    var expClaim = principal?.FindFirst("exp");
                    var nowUnix = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

                    if (expClaim != null && long.TryParse(expClaim.Value, out var expTime) && expTime < nowUnix)
                    {
                        context.Result = new UnauthorizedObjectResult(new
                        {
                            message = "Token has expired",
                            code = "token_expired",
                            expiredAt = DateTimeOffset.FromUnixTimeSeconds(expTime).UtcDateTime
                        });
                        return;
                    }
                }
                catch
                {
                    // If we can't extract expiration info, return generic invalid token message
                }

                context.Result = new UnauthorizedObjectResult(new
                {
                    message = "Invalid or malformed token",
                    code = "invalid_token"
                });
                return;
            }

            // Set the user principal for the request
            context.HttpContext.User = authService.GetClaimsPrincipalFromToken(token);
        }
        catch (Exception ex)
        {
            context.Result = new UnauthorizedObjectResult(new
            {
                message = "Token validation failed",
                error = ex.Message,
                code = "validation_failed"
            });
        }
    }
} 