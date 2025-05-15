using System.Text.Json;
using System.Text.Json.Serialization;

namespace Lithuaningo.API.Settings;

/// <summary>
/// Static class containing JSON serialization settings used throughout the application
/// </summary>
public static class JsonSettings
{
    /// <summary>
    /// Default JSON serializer options with common settings
    /// </summary>
    public static readonly JsonSerializerOptions DefaultOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        AllowTrailingCommas = true,
        ReadCommentHandling = JsonCommentHandling.Skip,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    /// <summary>
    /// JSON serializer options for AI-related operations
    /// </summary>
    public static readonly JsonSerializerOptions AiOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        AllowTrailingCommas = true,
        ReadCommentHandling = JsonCommentHandling.Skip,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };
}