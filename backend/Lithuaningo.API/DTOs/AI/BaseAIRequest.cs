namespace Lithuaningo.API.DTOs.AI;

/// <summary>
/// Base class for all AI-related requests
/// </summary>
public abstract class BaseAIRequest
{
    /// <summary>
    /// Optional context or additional parameters for the AI request
    /// </summary>
    public Dictionary<string, string>? Context { get; set; }
} 