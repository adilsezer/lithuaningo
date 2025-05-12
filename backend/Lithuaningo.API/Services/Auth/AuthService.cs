using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Lithuaningo.API.Services.Supabase;
using Lithuaningo.API.Services.UserProfile;
using Lithuaningo.API.Settings;
using Lithuaningo.API.Utilities;
using Microsoft.IdentityModel.Tokens;
using Supabase;

namespace Lithuaningo.API.Services.Auth;

public class AuthService : IAuthService
{
    private readonly Client _supabaseClient;
    private readonly ILogger<AuthService> _logger;
    private readonly SupabaseSettings _settings;
    private readonly TokenValidationParameters _tokenValidationParameters;
    private readonly IUserProfileService _userProfileService;

    public AuthService(
        ISupabaseConfiguration supabaseConfiguration,
        ILogger<AuthService> logger,
        IUserProfileService userProfileService)
    {
        _logger = logger;
        _settings = supabaseConfiguration.LoadConfiguration();
        _userProfileService = userProfileService;

        _logger.LogInformation("Initializing Supabase auth client");

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
            ClockSkew = TimeSpan.FromMinutes(5)
        };
    }

    public bool ValidateToken(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var principal = handler.ValidateToken(token, _tokenValidationParameters, out var validatedToken);

            var jwtToken = validatedToken as JwtSecurityToken;
            if (jwtToken == null)
            {
                _logger.LogWarning("Token is not a valid JWT token");
                return false;
            }

            // Look for user ID in various possible claim fields
            var userIdClaim = principal.FindFirst("sub") ??
                              principal.FindFirst(ClaimTypes.NameIdentifier) ?? // Add standard .NET claim type
                              principal.FindFirst("user_id") ??
                              principal.FindFirst("id") ??
                              principal.FindFirst("uid") ??
                              principal.FindFirst("userId");

            if (userIdClaim == null)
            {
                _logger.LogWarning("Token missing any user ID claim");
                return false;
            }

            return true;
        }
        catch (SecurityTokenExpiredException ex)
        {
            _logger.LogWarning(ex, "Token has expired");
            return false;
        }
        catch (SecurityTokenValidationException ex)
        {
            _logger.LogWarning(ex, "Token validation failed");
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

            // Look for user ID in various possible claim fields
            var userId = principal.FindFirst("sub")?.Value ??
                         principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? // Add standard .NET claim type
                         principal.FindFirst("user_id")?.Value ??
                         principal.FindFirst("id")?.Value ??
                         principal.FindFirst("uid")?.Value ??
                         principal.FindFirst("userId")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Token missing any user ID claim");
                return string.Empty;
            }

            return userId;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting user ID from token");
            return string.Empty;
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

    public async Task<bool> IsAdminAsync(ClaimsPrincipal user)
    {
        var userIdString = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
        {
            _logger.LogWarning("Could not extract valid User ID from token claims for admin check.");
            return false;
        }

        try
        {
            var userProfile = await _userProfileService.GetUserProfileAsync(userIdString);

            if (userProfile == null)
            {
                _logger.LogWarning("User profile not found in database for ID {UserId} during admin check.", userId);
                return false;
            }

            return userProfile.IsAdmin;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking admin status for User ID {UserId} by querying user_profiles table.", userId);
            return false;
        }
    }
}