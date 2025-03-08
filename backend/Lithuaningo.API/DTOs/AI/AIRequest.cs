namespace Lithuaningo.API.DTOs.AI;

/// <summary>
/// Unified request DTO for all AI services
/// </summary>
public class AIRequest : BaseAIRequest
{
    /// <summary>
    /// The text prompt to send to the AI
    /// </summary>
    public string Prompt { get; set; } = string.Empty;
    
    /// <summary>
    /// The type of AI service to use (e.g., "chat", "translation", "grammar")
    /// </summary>
    public string ServiceType { get; set; } = "chat";
} 