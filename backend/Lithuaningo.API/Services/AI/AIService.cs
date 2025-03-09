using System.Collections.Concurrent;
using Lithuaningo.API.Services.Interfaces;
using Lithuaningo.API.Settings;
using Microsoft.Extensions.Options;
using OpenAI.Chat;

namespace Lithuaningo.API.Services.AI;

/// <summary>
/// Unified service for handling AI interactions with OpenAI
/// </summary>
public class AIService : IAIService
{
    // Store conversation history for sessions
    protected readonly ConcurrentDictionary<string, List<ChatMessage>> _conversationHistories = new();
    
    // The chat client instance for this service
    private readonly ChatClient _chatClient;
    
    // The model name used by this service
    private readonly string _modelName;
    
    // Logger instance
    private readonly ILogger<AIService> _logger;
    
    // Configuration settings
    private readonly OpenAISettings _openAiSettings;

    /// <summary>
    /// Initializes a new instance of the <see cref="AIService"/> class.
    /// </summary>
    /// <param name="openAiSettings">The OpenAI settings</param>
    /// <param name="logger">The logger</param>
    /// <param name="chatClient">Optional chat client for testing</param>
    public AIService(
        IOptions<OpenAISettings> openAiSettings,
        ILogger<AIService> logger,
        ChatClient? chatClient = null)
    {
        _logger = logger;
        _openAiSettings = openAiSettings.Value;
        
        // Set the model name from settings
        _modelName = _openAiSettings.ChatModelName;
        
        // Use provided client or create a new one
        _chatClient = chatClient ?? CreateChatClient(_modelName);
        
        _logger.LogInformation("AIService initialized with model: {ModelName}", _modelName);
    }

    /// <summary>
    /// Gets the service name
    /// </summary>
    /// <returns>The name of the AI service</returns>
    public string GetServiceName() => "OpenAI";
    
    /// <summary>
    /// Gets the model name used by this service
    /// </summary>
    /// <returns>The name of the AI model</returns>
    public string GetModelName() => _modelName;

    /// <summary>
    /// Creates a new ChatClient with the configured API key
    /// </summary>
    /// <param name="modelName">Model name to use</param>
    /// <returns>A configured ChatClient instance</returns>
    protected virtual ChatClient CreateChatClient(string modelName)
    {
        _logger.LogInformation("Creating ChatClient with model: {Model}", modelName);
        return new ChatClient(modelName, _openAiSettings.ApiKey);
    }

    /// <summary>
    /// Processes an AI request and returns a response
    /// </summary>
    /// <param name="prompt">The text prompt to send to the AI</param>
    /// <param name="context">Optional context parameters for the request</param>
    /// <param name="serviceType">The type of AI service to use (e.g., "chat", "translation")</param>
    /// <returns>The AI's response text</returns>
    public async Task<string> ProcessRequestAsync(string prompt, Dictionary<string, string>? context = null, string serviceType = "chat")
    {
        try
        {
            // Delegate to the appropriate handler based on service type
            return await GetServiceHandler(serviceType.ToLowerInvariant())(prompt, context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing AI request: {Message}", ex.Message);
            return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
        }
    }
    
    /// <summary>
    /// Returns the appropriate handler function for the given service type
    /// </summary>
    /// <param name="serviceType">The type of AI service</param>
    /// <returns>A function that handles the specified service type</returns>
    protected virtual Func<string, Dictionary<string, string>?, Task<string>> GetServiceHandler(string serviceType)
    {
        return serviceType switch
        {
            "chat" => HandleChatRequestAsync,
            "translation" => HandleTranslationRequestAsync,
            "grammar" => HandleGrammarRequestAsync,
            _ => HandleChatRequestAsync // Default to chat
        };
    }

    /// <summary>
    /// Handles a chat request
    /// </summary>
    private async Task<string> HandleChatRequestAsync(string message, Dictionary<string, string>? context)
    {
        // Generate a session ID from context if available, otherwise use a default
        string sessionId = "default_session";
        if (context != null && context.TryGetValue("sessionId", out var id))
        {
            sessionId = id;
        }

        // Get or create conversation history for this session
        var conversationHistory = _conversationHistories.GetOrAdd(sessionId, _ => new List<ChatMessage>
        {
            new SystemChatMessage(_openAiSettings.SystemMessage)
        });

        // Add the user's message to the conversation history
        conversationHistory.Add(new UserChatMessage(message));

        // If conversation is too long, keep only the last 10 messages plus system prompt
        if (conversationHistory.Count > 11)
        {
            var systemMessage = conversationHistory[0];
            conversationHistory.RemoveRange(1, conversationHistory.Count - 11);
            conversationHistory.Insert(0, systemMessage);
        }

        // Send the request to OpenAI
        var completion = await _chatClient.CompleteChatAsync(conversationHistory.ToArray());
        
        // Extract the response text from the completion
        var aiResponse = completion.Value.Content[0].Text;
        if (string.IsNullOrEmpty(aiResponse))
        {
            aiResponse = "I'm sorry, I couldn't generate a response.";
        }

        // Add the AI's response to the conversation history
        conversationHistory.Add(new AssistantChatMessage(aiResponse));

        return aiResponse;
    }

    /// <summary>
    /// Handles a translation request
    /// </summary>
    private async Task<string> HandleTranslationRequestAsync(string text, Dictionary<string, string>? context)
    {
        // Extract target language from context, default to English
        string targetLanguage = "English";
        if (context != null && context.TryGetValue("targetLanguage", out var language))
        {
            targetLanguage = language;
        }

        // Create a one-time prompt for translation
        var messages = new ChatMessage[]
        {
            new SystemChatMessage("You are a helpful translation assistant. Translate the text to the specified language accurately."),
            new UserChatMessage($"Translate the following text to {targetLanguage}: {text}")
        };

        // Send the request to OpenAI
        var completion = await _chatClient.CompleteChatAsync(messages);
        
        // Extract the response text from the completion
        var translation = completion.Value.Content[0].Text;
        if (string.IsNullOrEmpty(translation))
        {
            translation = "I'm sorry, I couldn't translate the text.";
        }

        return translation;
    }

    /// <summary>
    /// Handles a grammar check request
    /// </summary>
    private async Task<string> HandleGrammarRequestAsync(string text, Dictionary<string, string>? context)
    {
        // Create a one-time prompt for grammar checking
        var messages = new ChatMessage[]
        {
            new SystemChatMessage("You are a helpful grammar assistant. Check and correct the grammar of the provided text."),
            new UserChatMessage($"Check and correct the grammar of the following text: {text}")
        };

        // Send the request to OpenAI
        var completion = await _chatClient.CompleteChatAsync(messages);
        
        // Extract the response text from the completion
        var correctedText = completion.Value.Content[0].Text;
        if (string.IsNullOrEmpty(correctedText))
        {
            correctedText = "I'm sorry, I couldn't check the grammar of the text.";
        }

        return correctedText;
    }

    /// <summary>
    /// Clears conversation history for testing purposes
    /// </summary>
    /// <param name="sessionId">Optional specific session ID to clear, or all if null</param>
    public virtual void ClearConversationHistory(string? sessionId = null)
    {
        if (sessionId != null)
        {
            _conversationHistories.TryRemove(sessionId, out _);
        }
        else
        {
            _conversationHistories.Clear();
        }
    }
} 