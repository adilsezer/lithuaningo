using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Supabase;
using Lithuaningo.API.Settings;

namespace Lithuaningo.API.Services.Auth;

public class AuthService : IAuthService
{
    private readonly Client _supabaseClient;
    private readonly ILogger<AuthService> _logger;
    private readonly SupabaseSettings _settings;
    private readonly TokenValidationParameters _tokenValidationParameters;

    public AuthService(
        ISupabaseConfiguration supabaseConfiguration,
        ILogger<AuthService> logger)
    {
        _logger = logger;
        _settings = supabaseConfiguration.LoadConfiguration();
        
        _logger.LogInformation("Initializing Supabase auth client with URL: {Url}", _settings.Url);

        var options = new SupabaseOptions
        {
            AutoRefreshToken = true,
            AutoConnectRealtime = true
        };

        _supabaseClient = new Client(
            _settings.Url,
            _settings.AnonKey,
            options
        );

        _tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = $"{_settings.Url}/auth/v1",
            ValidAudience = "authenticated",
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_settings.JwtSecret)),
            ClockSkew = TimeSpan.Zero
        };
    }

    public bool ValidateToken(string token)
    {
        try
        {
            _logger.LogInformation("Starting token validation");
            var handler = new JwtSecurityTokenHandler();
            var principal = handler.ValidateToken(token, _tokenValidationParameters, out var validatedToken);

            var jwtToken = validatedToken as JwtSecurityToken;
            if (jwtToken == null)
            {
                _logger.LogWarning("Token is not a valid JWT token");
                return false;
            }

            // Verify required Supabase claims
            var userIdClaim = principal.FindFirst("sub");
            var roleClaim = principal.FindFirst("role");
            var emailClaim = principal.FindFirst("email");
            var audClaim = principal.FindFirst("aud");

            if (userIdClaim == null)
            {
                _logger.LogWarning("Token missing required claim: sub (user id)");
                return false;
            }

            if (roleClaim == null)
            {
                _logger.LogWarning("Token missing required claim: role");
                return false;
            }

            if (audClaim == null)
            {
                _logger.LogWarning("Token missing required claim: aud (audience)");
                return false;
            }

            // Verify role is either 'authenticated' or 'admin'
            var role = roleClaim.Value;
            if (role != "authenticated" && role != "admin")
            {
                _logger.LogWarning("Invalid role claim in token: {Role}", role);
                return false;
            }

            // Verify audience
            var audience = audClaim.Value;
            if (audience != "authenticated")
            {
                _logger.LogWarning("Invalid audience in token: {Audience}", audience);
                return false;
            }

            // Check token expiration
            var expClaim = principal.FindFirst("exp");
            if (expClaim != null && long.TryParse(expClaim.Value, out var expTime))
            {
                var nowUnix = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                if (expTime < nowUnix)
                {
                    _logger.LogWarning("Token has expired. Expiration: {ExpTime}, Current: {NowUnix}", expTime, nowUnix);
                    return false;
                }
            }
            else
            {
                _logger.LogWarning("Token missing or has invalid expiration claim");
                return false;
            }

            _logger.LogInformation("Token validation successful for user {UserId}", userIdClaim.Value);
            return true;
        }
        catch (SecurityTokenExpiredException ex)
        {
            _logger.LogWarning(ex, "Token has expired");
            return false;
        }
        catch (SecurityTokenValidationException ex)
        {
            _logger.LogWarning(ex, "Token validation failed: {Message}", ex.Message);
            return false;
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
            var principal = handler.ValidateToken(token, _tokenValidationParameters, out _);
            
            var userId = principal.FindFirst("sub")?.Value;
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
            return handler.ValidateToken(token, _tokenValidationParameters, out _);
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