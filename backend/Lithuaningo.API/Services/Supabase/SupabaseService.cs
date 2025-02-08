using Lithuaningo.API.Settings;
using Supabase;

namespace Lithuaningo.API.Services;

public interface ISupabaseService
{
    Client Client { get; }
    Task InitializeAsync();
}

public class SupabaseService : ISupabaseService
{
    private readonly Client _client;
    private readonly SupabaseSettings _settings;

    public SupabaseService(
        IConfiguration configuration,
        ISupabaseConfiguration supabaseConfiguration)
    {
        var credentialsPath = Path.Combine(Directory.GetCurrentDirectory(), "credentials/supabase/settings.json");
        _settings = supabaseConfiguration.LoadConfiguration(credentialsPath);

        var options = new SupabaseOptions
        {
            AutoRefreshToken = true,
            AutoConnectRealtime = true
        };

        _client = new Client(
            _settings.Url,
            _settings.ServiceKey,
            options
        );
    }

    public Client Client => _client;

    public async Task InitializeAsync()
    {
        await _client.InitializeAsync();
    }
} 