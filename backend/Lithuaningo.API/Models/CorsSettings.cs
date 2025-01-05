using System;

namespace Lithuaningo.API.Models;

public class CorsSettings
{
    public string[] AllowedOrigins { get; set; } = Array.Empty<string>();
}