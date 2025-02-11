namespace Lithuaningo.API.Settings;

public class SupabaseSettings
{
    public string Url { get; set; } = string.Empty;
    public string AnonKey { get; set; } = string.Empty;
    public string ServiceKey { get; set; } = string.Empty;

    public void Validate()
    {
        if (string.IsNullOrEmpty(Url))
            throw new InvalidOperationException("Supabase URL is required");
        if (string.IsNullOrEmpty(ServiceKey))
            throw new InvalidOperationException("Supabase Service Key is required");
        if (string.IsNullOrEmpty(AnonKey))
            throw new InvalidOperationException("Supabase Anon Key is required");
    }
} 