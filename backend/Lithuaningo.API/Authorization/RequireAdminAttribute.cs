using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Lithuaningo.API.Services.Auth;
using Microsoft.Extensions.Hosting;

namespace Lithuaningo.API.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RequireAdminAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // Get environment service
        var env = context.HttpContext.RequestServices
            .GetRequiredService<IHostEnvironment>();

        // Skip admin check in development
        if (env.IsDevelopment())
            return;

        var authService = context.HttpContext.RequestServices.GetRequiredService<IAuthService>();
        
        if (!authService.IsAdmin(context.HttpContext.User))
        {
            context.Result = new ForbidResult();
            return;
        }
    }
} 