namespace Lithuaningo.API.DTOs.AI;

/// <summary>
/// Unified request DTO for all AI services
/// </summary>
public class AIRequest
{
    /// <summary>
    /// The text prompt to send to the AI
    /// </summary>
    public string Prompt { get; set; } = string.Empty;
    
    /// <summary>
    /// The type of AI service to use (e.g., "chat", "translation", "grammar")
    /// </summary>
    public string ServiceType { get; set; } = "chat";
    
    /// <summary>
    /// Optional context or additional parameters for the AI request
    /// </summary>
    public Dictionary<string, string>? Context { get; set; }
} 