using System.Threading.Tasks;
using Lithuaningo.API.DTOs.AI;

namespace Lithuaningo.API.Services.Interfaces;

/// <summary>
/// Unified interface for all AI services
/// </summary>
public interface IAIService
{
    /// <summary>
    /// Gets the service name
    /// </summary>
    /// <returns>The name of the AI service</returns>
    string GetServiceName();
    
    /// <summary>
    /// Gets the model name used by this service
    /// </summary>
    /// <returns>The name of the AI model</returns>
    string GetModelName();
    
    /// <summary>
    /// Processes an AI request and returns a response
    /// </summary>
    /// <param name="prompt">The text prompt to send to the AI</param>
    /// <param name="context">Optional context parameters for the request</param>
    /// <param name="serviceType">The type of AI service to use (e.g., "chat", "translation")</param>
    /// <returns>The AI's response text</returns>
    Task<string> ProcessRequestAsync(string prompt, Dictionary<string, string>? context = null, string serviceType = "chat");
} 