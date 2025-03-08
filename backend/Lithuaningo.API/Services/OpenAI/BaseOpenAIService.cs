using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;
using OpenAI;
using OpenAI.Chat;

namespace Lithuaningo.API.Services.OpenAI;

/// <summary>
/// Base abstract class for all OpenAI service implementations
/// providing common functionality and configuration
/// </summary>
public abstract class BaseOpenAIService
{
    /// <summary>
    /// Logger instance for the service
    /// </summary>
    protected readonly ILogger _logger;
    
    /// <summary>
    /// The OpenAI client for API access
    /// </summary>
    protected readonly OpenAIClient _openAiClient;
    
    /// <summary>
    /// Configuration settings for OpenAI
    /// </summary>
    protected readonly OpenAISettings _openAiSettings;

    /// <summary>
    /// Initializes a new instance of the <see cref="BaseOpenAIService"/> class.
    /// </summary>
    /// <param name="openAiSettings">The OpenAI settings</param>
    /// <param name="logger">The logger</param>
    protected BaseOpenAIService(
        IOptions<OpenAISettings> openAiSettings,
        ILogger logger)
    {
        _openAiSettings = openAiSettings.Value;
        _logger = logger;
        _openAiClient = new OpenAIClient(_openAiSettings.ApiKey);
    }
    
    /// <summary>
    /// Creates and returns a ChatClient with the configured API key
    /// </summary>
    /// <param name="modelName">Optional model name override, uses configured ChatModelName if not specified</param>
    /// <returns>A configured ChatClient instance</returns>
    protected ChatClient GetChatClient(string? modelName = null)
    {
        return new ChatClient(
            modelName ?? _openAiSettings.ChatModelName,
            _openAiSettings.ApiKey);
    }
} 