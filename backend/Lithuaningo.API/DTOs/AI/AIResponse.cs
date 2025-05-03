namespace Lithuaningo.API.DTOs.AI;

/// <summary>
/// Unified response DTO for all AI services
/// </summary>
public class AIResponse
{
    /// <summary>
    /// The response text from the AI
    /// </summary>
    public string Response { get; set; } = string.Empty;
    
    /// <summary>
    /// Timestamp of the response
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Type of AI service that provided the response
    /// </summary>
    public string ServiceType { get; set; } = string.Empty;
} 