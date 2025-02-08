namespace Lithuaningo.API.Settings;

public class SupabaseSettingsWrapper
{
    public SupabaseSettings Supabase { get; set; } = null!;
}

public class SupabaseSettings
{
    public string Url { get; set; } = string.Empty;
    public string AnonKey { get; set; } = string.Empty;
    public string ServiceKey { get; set; } = string.Empty;
} 