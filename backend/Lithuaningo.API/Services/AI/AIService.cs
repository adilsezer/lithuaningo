using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Lithuaningo.API.DTOs.Challenge;
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
    #region Constants
    
    // Supported service types - only include what we actually use
    public const string CHAT_SERVICE = "chat";
    public const string CHALLENGE_SERVICE = "challenge";
    
    // Chat system instructions
    private const string CHAT_SYSTEM_INSTRUCTIONS = 
        "You are a Lithuanian language learning assistant named Lithuaningo AI. " +
        "Only answer questions related to Lithuanian language, culture, history, or travel in Lithuania. " +
        "For any questions not related to Lithuanian topics, politely explain that you can only help with Lithuanian-related topics. " +
        "Always incorporate at least one Lithuanian word or fact in your responses to help the user learn. " +
        "Use friendly, conversational language suitable for a language learning app.";
    
    // Challenge system instructions with complete format requirements
    private const string CHALLENGE_SYSTEM_INSTRUCTIONS = @"You are a teaching assistant specialized in creating Lithuanian language challenges.

Your task is to generate 5 Lithuanian language challenges for our learning app.

FORMAT REQUIREMENTS: 
- Return a valid JSON array of challenges
- Do NOT include any explanations, comments, or markdown formatting like triple backticks
- Return ONLY the JSON array

EACH QUESTION MUST HAVE:
- question: A Lithuanian phrase or word with English translation in parentheses
- options: An array of exactly 4 possible answers in Lithuanian
- correctAnswer: The correct option (must match exactly one of the options)
- exampleSentence: An example usage in Lithuanian
- type: MUST be one of these EXACT values (no quotes): 0 for MultipleChoice, 1 for TrueFalse, 2 for FillInTheBlank

EXAMPLE OF EXPECTED JSON STRUCTURE (do not copy these examples, create new ones):
[
  {
    ""question"": ""Labas (Hello)"",
    ""options"": [""Labas"", ""Viso gero"", ""Ačiū"", ""Prašau""],
    ""correctAnswer"": ""Labas"",
    ""exampleSentence"": ""Labas, kaip sekasi?"",
    ""type"": 0
  },
  {
    ""question"": ""Ar tu kalbi lietuviškai? (Do you speak Lithuanian?)"",
    ""options"": [""Taip"", ""Ne""],
    ""correctAnswer"": ""Taip"",
    ""exampleSentence"": ""Ar tu kalbi lietuviškai? Taip, kalbu."",
    ""type"": 1
  },
  {
    ""question"": ""Aš esu (I am) ______."",
    ""options"": [""studentas"", ""mokytojas"", ""gydytojas"", ""inžinierius""],
    ""correctAnswer"": ""studentas"",
    ""exampleSentence"": ""Aš esu studentas universitete."",
    ""type"": 2
  }
]

CONTENT GUIDELINES:
- Focus on common Lithuanian phrases, vocabulary, and basic grammar
- Include a mix of greetings, daily expressions, and basic vocabulary
- Make questions appropriate for beginners to intermediate learners
- Ensure all text in Lithuanian uses correct characters and spelling";

    #endregion
    
    #region Private Fields
    
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
    
    #endregion
    
    #region Constructor
    
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
    
    #endregion
    
    #region Public Methods
    
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
    /// Processes an AI request and returns a response
    /// </summary>
    /// <param name="prompt">The text prompt to send to the AI</param>
    /// <param name="context">Optional context parameters for the request</param>
    /// <param name="serviceType">The type of AI service to use (chat or challenge)</param>
    /// <returns>The AI's response text</returns>
    public async Task<string> ProcessRequestAsync(string prompt, Dictionary<string, string>? context = null, string serviceType = "chat")
    {
        try
        {
            // Log the type of request being processed
            _logger.LogInformation("Processing {ServiceType} request", serviceType);
            
            // Use our simplified service handler - only chat and challenge are supported
            return serviceType.ToLowerInvariant() switch
            {
                CHAT_SERVICE => await HandleChatRequestAsync(prompt, context),
                CHALLENGE_SERVICE => await HandleChallengeRequestAsync(),
                _ => await HandleChatRequestAsync(prompt, context) // Default to chat
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing AI request: {Message}", ex.Message);
            return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
        }
    }
    
    /// <summary>
    /// Generates challenges using AI
    /// </summary>
    /// <returns>A list of challenges</returns>
    public async Task<List<CreateChallengeQuestionRequest>> GenerateChallengeQuestionsAsync()
    {
        // Retry up to 3 times if necessary
        for (int attempt = 1; attempt <= 3; attempt++)
        {
            try
            {
                _logger.LogInformation("Generating challenges with AI, attempt {Attempt}", attempt);
                
                // Get raw JSON response from the AI
                var jsonResponse = await HandleChallengeRequestAsync();
                
                if (string.IsNullOrEmpty(jsonResponse))
                {
                    _logger.LogWarning("AI returned empty response on attempt {Attempt}", attempt);
                    continue;
                }
                
                // Extract and clean up JSON content
                var jsonContent = ExtractJsonFromAiResponse(jsonResponse);
                
                // Convert string enum values to integers if needed
                if (!string.IsNullOrEmpty(jsonContent))
                {
                    jsonContent = ConvertStringTypeToIntIfNeeded(jsonContent);
                }
                
                // Try to deserialize the JSON
                List<CreateChallengeQuestionRequest>? generatedQuestions = null;
                try
                {
                    // Parse the JSON response into challenge question models
                    generatedQuestions = JsonSerializer.Deserialize<List<CreateChallengeQuestionRequest>>(
                        jsonContent ?? string.Empty,
                        new JsonSerializerOptions { 
                            PropertyNameCaseInsensitive = true,
                            AllowTrailingCommas = true,
                            ReadCommentHandling = JsonCommentHandling.Skip,
                            Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
                        }
                    );
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "JSON deserialization error on attempt {Attempt}", attempt);
                    continue;
                }
                
                // Validate the questions
                if (generatedQuestions != null && ValidateGeneratedChallenges(generatedQuestions))
                {
                    _logger.LogInformation("Successfully generated {Count} valid challenges", generatedQuestions.Count);
                    return generatedQuestions;
                }
                
                _logger.LogWarning("Generated challenges failed validation on attempt {Attempt}", attempt);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating challenges on attempt {Attempt}", attempt);
            }
        }
        
        // If we reach here, all attempts failed
        throw new InvalidOperationException("Failed to generate valid challenges after multiple attempts");
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
    
    #endregion
    
    #region Protected Methods
    
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
    
    #endregion
    
    #region Private Methods
    
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
            new SystemChatMessage(CHAT_SYSTEM_INSTRUCTIONS)
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
    /// Handles a challenge generation request
    /// </summary>
    private async Task<string> HandleChallengeRequestAsync()
    {
        // For challenge generation, we use detailed system instructions and a simple prompt
        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(CHALLENGE_SYSTEM_INSTRUCTIONS),
            new UserChatMessage("Generate 5 Lithuanian language challenges following the format specified in your instructions.")
        };

        // Send the request to OpenAI
        var completion = await _chatClient.CompleteChatAsync(messages.ToArray());
        
        // Extract the response text from the completion
        var jsonResponse = completion.Value.Content[0].Text;
        if (string.IsNullOrEmpty(jsonResponse))
        {
            return "[]"; // Return empty JSON array if no response
        }
        
        return jsonResponse;
    }
    
    /// <summary>
    /// Validates the generated challenges
    /// </summary>
    private bool ValidateGeneratedChallenges(List<CreateChallengeQuestionRequest> questions)
    {
        if (questions == null || !questions.Any())
        {
            _logger.LogWarning("No challenges were generated");
            return false;
        }

        foreach (var question in questions)
        {
            // Check required fields
            if (string.IsNullOrWhiteSpace(question.Question))
            {
                _logger.LogWarning("Question text is missing");
                return false;
            }

            if (string.IsNullOrWhiteSpace(question.CorrectAnswer))
            {
                _logger.LogWarning("CorrectAnswer is missing");
                return false;
            }

            // Check options
            if (question.Options == null || !question.Options.Any())
            {
                _logger.LogWarning("Options array is missing or empty");
                return false;
            }

            // Make sure correct answer is in the options
            if (!question.Options.Contains(question.CorrectAnswer))
            {
                _logger.LogWarning("CorrectAnswer is not found in the options array");
                return false;
            }

            // Validate question type
            if (!Enum.IsDefined(typeof(ChallengeQuestionType), question.Type))
            {
                _logger.LogWarning("Invalid question type value: {Type}", question.Type);
                return false;
            }
        }

        return true;
    }
    
    /// <summary>
    /// Extracts JSON content from potential markdown code blocks
    /// </summary>
    private string ExtractJsonFromAiResponse(string aiResponse)
    {
        if (string.IsNullOrEmpty(aiResponse))
        {
            return string.Empty;
        }

        // Check if the response is a markdown code block and extract the JSON content
        var jsonBlockPattern = @"```(?:json)?\s*\n([\s\S]*?)\n```";
        var jsonBlockMatch = Regex.Match(aiResponse, jsonBlockPattern);

        if (jsonBlockMatch.Success && jsonBlockMatch.Groups.Count > 1)
        {
            return jsonBlockMatch.Groups[1].Value.Trim();
        }

        // If no markdown code block, try to find a JSON array directly
        var jsonArrayPattern = @"^\s*\[\s*\{[\s\S]*\}\s*\]\s*$";
        var jsonArrayMatch = Regex.Match(aiResponse, jsonArrayPattern);

        if (jsonArrayMatch.Success)
        {
            return jsonArrayMatch.Value.Trim();
        }

        // If no direct JSON array, return the full response (which might be JSON or might need more cleanup)
        return aiResponse.Trim();
    }
    
    /// <summary>
    /// Converts string type values to integers if needed (to handle AI sometimes returning string enum values)
    /// </summary>
    private string ConvertStringTypeToIntIfNeeded(string jsonContent)
    {
        // Try to handle cases where the type is provided as a string like "0", "1", "2"
        // or as words like "MultipleChoice", "TrueFalse", "FillInTheBlank"
        var typePatterns = new Dictionary<string, string>
        {
            { @"""type""\s*:\s*""0""", @"""type"":0" },
            { @"""type""\s*:\s*""1""", @"""type"":1" },
            { @"""type""\s*:\s*""2""", @"""type"":2" },
            { @"""type""\s*:\s*""MultipleChoice""", @"""type"":0" },
            { @"""type""\s*:\s*""TrueFalse""", @"""type"":1" },
            { @"""type""\s*:\s*""FillInTheBlank""", @"""type"":2" }
        };

        foreach (var pattern in typePatterns)
        {
            jsonContent = Regex.Replace(jsonContent, pattern.Key, pattern.Value, RegexOptions.IgnoreCase);
        }

        return jsonContent;
    }
    
    #endregion
} 