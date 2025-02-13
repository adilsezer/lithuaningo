using System.Security.Claims;

namespace Lithuaningo.API.Services.Auth;

public interface IAuthService
{
    Task<bool> ValidateTokenAsync(string token);
    string GetUserIdFromToken(string token);
    ClaimsPrincipal GetClaimsPrincipalFromToken(string token);
    bool IsAdmin(ClaimsPrincipal user);
} 