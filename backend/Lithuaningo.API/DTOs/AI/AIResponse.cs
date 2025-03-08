namespace Lithuaningo.API.DTOs.AI;

/// <summary>
/// Unified response DTO for all AI services
/// </summary>
public class AIResponse : BaseAIResponse
{
    /// <summary>
    /// The response text from the AI
    /// </summary>
    public string Response { get; set; } = string.Empty;
} 