using Lithuaningo.API.Settings;
using Supabase;

namespace Lithuaningo.API.Services.Supabase;

public interface ISupabaseService
{
    Client Client { get; }
    Task InitializeAsync();
}

public class SupabaseService : ISupabaseService
{
    private readonly Client _client;
    private readonly ILogger<SupabaseService> _logger;

    public SupabaseService(
        ISupabaseConfiguration supabaseConfiguration,
        ILogger<SupabaseService> logger)
    {
        _logger = logger;

        var settings = supabaseConfiguration.LoadConfiguration();

        var options = new SupabaseOptions
        {
            AutoRefreshToken = true,
            AutoConnectRealtime = true
        };

        _client = new Client(
            settings.Url,
            settings.ServiceKey,
            options
        );
    }

    public Client Client => _client;

    public async Task InitializeAsync()
    {
        try
        {
            await _client.InitializeAsync();
            _logger.LogInformation("Supabase client initialized successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize Supabase client");
            throw;
        }
    }
}