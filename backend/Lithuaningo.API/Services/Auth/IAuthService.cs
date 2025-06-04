using System.Security.Claims;
using System.Threading.Tasks;

namespace Lithuaningo.API.Services.Auth;

public interface IAuthService
{
    bool ValidateToken(string token);
    string GetUserIdFromToken(string token);
    ClaimsPrincipal GetClaimsPrincipalFromToken(string token);
    Task<bool> IsAdminAsync(ClaimsPrincipal user);
}