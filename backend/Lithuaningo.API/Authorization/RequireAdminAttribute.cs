using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Lithuaningo.API.Services.Auth;

namespace Lithuaningo.API.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RequireAdminAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var authService = context.HttpContext.RequestServices.GetRequiredService<IAuthService>();
        
        if (!authService.IsAdmin(context.HttpContext.User))
        {
            context.Result = new ForbidResult();
            return;
        }
    }
} 