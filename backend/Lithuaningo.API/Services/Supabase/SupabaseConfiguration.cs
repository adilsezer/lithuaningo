using Lithuaningo.API.Settings;
using System.Text.Json;

namespace Lithuaningo.API.Services;

public interface ISupabaseConfiguration
{
    SupabaseSettings LoadConfiguration(string credentialsPath);
}

public class SupabaseConfiguration : ISupabaseConfiguration
{
    public SupabaseSettings LoadConfiguration(string credentialsPath)
    {
        if (!File.Exists(credentialsPath))
        {
            throw new FileNotFoundException($"Supabase credentials file not found at: {credentialsPath}");
        }

        var credentialsJson = File.ReadAllText(credentialsPath);
        var wrapper = JsonSerializer.Deserialize<SupabaseSettingsWrapper>(credentialsJson)
            ?? throw new InvalidOperationException("Invalid Supabase credentials format");

        ValidateSettings(wrapper.Supabase);
        return wrapper.Supabase;
    }

    private static void ValidateSettings(SupabaseSettings settings)
    {
        if (string.IsNullOrEmpty(settings.Url))
            throw new InvalidOperationException("Supabase URL is required");
        if (string.IsNullOrEmpty(settings.ServiceKey))
            throw new InvalidOperationException("Supabase Service Key is required");
        if (string.IsNullOrEmpty(settings.AnonKey))
            throw new InvalidOperationException("Supabase Anon Key is required");
    }
} 