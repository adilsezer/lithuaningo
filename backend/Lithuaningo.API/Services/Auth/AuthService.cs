using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Supabase;

namespace Lithuaningo.API.Services.Auth;

public class AuthService : IAuthService
{
    private readonly Client _supabaseClient;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        ISupabaseConfiguration supabaseConfiguration,
        ILogger<AuthService> logger)
    {
        _logger = logger;
        
        var settings = supabaseConfiguration.LoadConfiguration();
        _logger.LogInformation("Initializing Supabase auth client with URL: {Url}", settings.Url);

        var options = new SupabaseOptions
        {
            AutoRefreshToken = true,
            AutoConnectRealtime = true
        };

        _supabaseClient = new Client(
            settings.Url,
            settings.AnonKey, // Use AnonKey for auth service
            options
        );
    }

    public async Task<bool> ValidateTokenAsync(string token)
    {
        try
        {
            var user = await _supabaseClient.Auth.GetUser(token);
            return user != null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating token");
            return false;
        }
    }

    public string GetUserIdFromToken(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            
            var userId = jwtToken.Claims.FirstOrDefault(claim => claim.Type == "sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                throw new InvalidOperationException("Token does not contain a user ID claim");
            }
            
            return userId;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user ID from token");
            throw;
        }
    }

    public ClaimsPrincipal GetClaimsPrincipalFromToken(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);

            var claims = new List<Claim>();
            claims.AddRange(jwtToken.Claims);

            var identity = new ClaimsIdentity(claims, "Supabase");
            return new ClaimsPrincipal(identity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting claims principal from token");
            throw;
        }
    }

    public bool IsAdmin(ClaimsPrincipal user)
    {
        return user.Claims.Any(c => c.Type == "role" && c.Value == "admin");
    }
} 