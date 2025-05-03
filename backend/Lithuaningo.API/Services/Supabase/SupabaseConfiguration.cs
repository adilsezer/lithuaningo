using System.Text.Json;
using Lithuaningo.API.Settings;

namespace Lithuaningo.API.Services.Supabase;

public interface ISupabaseConfiguration
{
    SupabaseSettings LoadConfiguration();
}

public class SupabaseConfiguration : ISupabaseConfiguration
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<SupabaseConfiguration> _logger;

    public SupabaseConfiguration(
        IConfiguration configuration,
        IWebHostEnvironment environment,
        ILogger<SupabaseConfiguration> logger)
    {
        _configuration = configuration;
        _environment = environment;
        _logger = logger;
    }

    public SupabaseSettings LoadConfiguration()
    {
        var settings = _configuration.GetSection("Supabase").Get<SupabaseSettings>();

        if (settings == null)
        {
            throw new InvalidOperationException(
                "Supabase settings not found in configuration. " +
                "Please ensure the Supabase section is properly configured in appsettings.json " +
                "or use User Secrets for local development.");
        }

        settings.Validate();

        _logger.LogInformation("Supabase configuration loaded successfully from {Environment} environment",
            _environment.EnvironmentName);

        return settings;
    }
}