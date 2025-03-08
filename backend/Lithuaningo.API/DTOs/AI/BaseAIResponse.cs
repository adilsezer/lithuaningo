namespace Lithuaningo.API.DTOs.AI;

/// <summary>
/// Base class for all AI-related responses
/// </summary>
public abstract class BaseAIResponse
{
    /// <summary>
    /// Timestamp of the response
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Type of AI service that provided the response
    /// </summary>
    public string ServiceType { get; set; } = string.Empty;
} 